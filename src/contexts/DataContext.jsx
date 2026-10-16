import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  increment,
  serverTimestamp,
  Timestamp,
  getDoc,
  getDocs,
  setDoc,
  limit,
} from 'firebase/firestore';
import { db } from '../firestore';
import { useAuth } from './AuthContext';
import { useT } from '../i18n';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_WALLETS } from '../utils/defaults';
import { monthKey, dayKey } from '../utils/format';

const DataContext = createContext(null);

const BATCH_SIZE = 400; // Firestore allows 500 writes per batch; keep headroom for wallet updates

function col(uid, name) {
  return collection(db, 'users', uid, name);
}

function toDate(val) {
  if (!val) return new Date();
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val);
}

// Firestore resolves a write's promise only once the SERVER acknowledges it.
// Offline that never happens until reconnect - but the write is already applied
// locally and queued, so don't leave the UI spinning: let it continue and sync later.
function settle(promise) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    promise.catch((e) => console.error('Queued write failed', e));
    return Promise.resolve();
  }
  return promise;
}

export function DataProvider({ children }) {
  const { user } = useAuth();
  const t = useT();
  const uid = user?.uid || null;

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [ready, setReady] = useState({ tx: false, cat: false, wal: false });
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Seed default categories + wallets exactly once per account. A `seeded` flag
  // on the user document means deleting every category later doesn't bring the
  // defaults back, and returning users skip two extra reads on every launch.
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (cancelled || userSnap.data()?.seeded) return;
        const [catSnap, walSnap] = await Promise.all([
          getDocs(query(col(uid, 'categories'), limit(1))),
          getDocs(query(col(uid, 'wallets'), limit(1))),
        ]);
        if (cancelled) return;
        const tr = tRef.current;
        const batch = writeBatch(db);
        if (catSnap.empty) {
          DEFAULT_EXPENSE_CATEGORIES.forEach(({ key, ...c }) => {
            batch.set(doc(col(uid, 'categories')), { ...c, name: tr(key), type: 'expense', createdAt: serverTimestamp() });
          });
          DEFAULT_INCOME_CATEGORIES.forEach(({ key, ...c }) => {
            batch.set(doc(col(uid, 'categories')), { ...c, name: tr(key), type: 'income', createdAt: serverTimestamp() });
          });
        }
        if (walSnap.empty) {
          DEFAULT_WALLETS.forEach(({ key, ...w }) => {
            batch.set(doc(col(uid, 'wallets')), { ...w, name: tr(key), createdAt: serverTimestamp() });
          });
        }
        batch.set(userRef, { seeded: true }, { merge: true });
        await batch.commit();
      } catch (e) {
        console.error('Seed error', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  useEffect(() => {
    if (!uid) return undefined;
    const mark = (k) => setReady((r) => (r[k] ? r : { ...r, [k]: true }));
    const unsubs = [
      onSnapshot(
        query(col(uid, 'transactions'), orderBy('date', 'desc')),
        (snap) => {
          setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data(), date: toDate(d.data().date) })));
          mark('tx');
        },
        () => mark('tx'),
      ),
      onSnapshot(
        col(uid, 'categories'),
        (snap) => {
          setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          mark('cat');
        },
        () => mark('cat'),
      ),
      onSnapshot(
        col(uid, 'wallets'),
        (snap) => {
          setWallets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          mark('wal');
        },
        () => mark('wal'),
      ),
    ];
    return () => {
      unsubs.forEach((u) => u());
      setReady({ tx: false, cat: false, wal: false });
    };
  }, [uid]);

  const loading = !!uid && !(ready.tx && ready.cat && ready.wal);

  // ---------- Transactions ----------
  // Each write combines the transaction + wallet balance update into a single
  // writeBatch: one network round-trip instead of several sequential awaits.
  const addTransaction = useCallback(
    async (payload) => {
      if (!uid) return;
      const batch = writeBatch(db);
      const ref = doc(col(uid, 'transactions'));
      batch.set(ref, {
        type: payload.type,
        amount: Number(payload.amount),
        categoryId: payload.categoryId,
        walletId: payload.walletId,
        date: Timestamp.fromDate(new Date(payload.date)),
        note: (payload.note || '').trim(),
        createdAt: serverTimestamp(),
      });
      const sign = payload.type === 'income' ? 1 : -1;
      batch.update(doc(db, 'users', uid, 'wallets', payload.walletId), {
        balance: increment(sign * Number(payload.amount)),
      });
      await settle(batch.commit());
      return ref.id;
    },
    [uid],
  );

  const updateTransaction = useCallback(
    async (id, payload, previous) => {
      if (!uid) return;
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', uid, 'transactions', id), {
        type: payload.type,
        amount: Number(payload.amount),
        categoryId: payload.categoryId,
        walletId: payload.walletId,
        date: Timestamp.fromDate(new Date(payload.date)),
        note: (payload.note || '').trim(),
      });
      // Net the balance change per wallet so a same-wallet edit is one increment.
      const deltas = {};
      if (previous) {
        const prevSign = previous.type === 'income' ? -1 : 1;
        deltas[previous.walletId] = (deltas[previous.walletId] || 0) + prevSign * Number(previous.amount);
      }
      const sign = payload.type === 'income' ? 1 : -1;
      deltas[payload.walletId] = (deltas[payload.walletId] || 0) + sign * Number(payload.amount);
      Object.entries(deltas).forEach(([walletId, delta]) => {
        if (delta !== 0) batch.update(doc(db, 'users', uid, 'wallets', walletId), { balance: increment(delta) });
      });
      await settle(batch.commit());
    },
    [uid],
  );

  const deleteTransaction = useCallback(
    async (tx) => {
      if (!uid) return;
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', uid, 'transactions', tx.id));
      batch.update(doc(db, 'users', uid, 'wallets', tx.walletId), {
        balance: increment((tx.type === 'income' ? -1 : 1) * Number(tx.amount)),
      });
      await settle(batch.commit());
    },
    [uid],
  );

  /**
   * Bulk import. Missing categories/wallets are created first, then the
   * transactions are written in batches (with one aggregated balance update per
   * wallet per batch) - orders of magnitude faster than one write per row.
   */
  const importTransactions = useCallback(
    async (rows) => {
      if (!uid || !rows.length) return 0;
      const catMap = new Map(categories.map((c) => [`${c.type}:${c.name.toLowerCase()}`, c.id]));
      const walletMap = new Map(wallets.map((w) => [w.name.toLowerCase(), w.id]));

      const setup = writeBatch(db);
      let needsSetup = false;
      rows.forEach((row) => {
        const catKey = `${row.type}:${row.categoryName.toLowerCase()}`;
        if (!catMap.has(catKey)) {
          const ref = doc(col(uid, 'categories'));
          setup.set(ref, { name: row.categoryName, type: row.type, emoji: '🏷️', color: '#64748B', createdAt: serverTimestamp() });
          catMap.set(catKey, ref.id);
          needsSetup = true;
        }
        const walletKey = row.walletName.toLowerCase();
        if (!walletMap.has(walletKey)) {
          const ref = doc(col(uid, 'wallets'));
          setup.set(ref, { name: row.walletName, icon: 'account_balance_wallet', color: '#64748B', balance: 0, createdAt: serverTimestamp() });
          walletMap.set(walletKey, ref.id);
          needsSetup = true;
        }
      });
      if (needsSetup) await settle(setup.commit());

      let imported = 0;
      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const chunk = rows.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        const deltas = {};
        chunk.forEach((row) => {
          const walletId = walletMap.get(row.walletName.toLowerCase());
          batch.set(doc(col(uid, 'transactions')), {
            type: row.type,
            amount: row.amount,
            categoryId: catMap.get(`${row.type}:${row.categoryName.toLowerCase()}`),
            walletId,
            date: Timestamp.fromDate(row.date),
            note: row.note || '',
            createdAt: serverTimestamp(),
          });
          deltas[walletId] = (deltas[walletId] || 0) + (row.type === 'income' ? 1 : -1) * row.amount;
        });
        Object.entries(deltas).forEach(([walletId, delta]) => {
          batch.update(doc(db, 'users', uid, 'wallets', walletId), { balance: increment(delta) });
        });
        await settle(batch.commit());
        imported += chunk.length;
      }
      return imported;
    },
    [uid, categories, wallets],
  );

  /** Bulk-create categories that don't exist yet (same type + name = skipped). Returns how many were added. */
  const importCategories = useCallback(
    async (rows) => {
      if (!uid || !rows.length) return 0;
      const existing = new Set(categories.map((c) => `${c.type}:${c.name.toLowerCase()}`));
      const fresh = rows.filter((r) => !existing.has(`${r.type}:${r.name.toLowerCase()}`));
      for (let i = 0; i < fresh.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        fresh.slice(i, i + BATCH_SIZE).forEach((r) => {
          batch.set(doc(col(uid, 'categories')), { name: r.name, type: r.type, emoji: r.emoji, color: r.color, createdAt: serverTimestamp() });
        });
        await settle(batch.commit());
      }
      return fresh.length;
    },
    [uid, categories],
  );

  // ---------- Categories ----------
  const addCategory = useCallback(
    async (payload) => {
      if (!uid) return;
      const ref = doc(col(uid, 'categories'));
      await settle(
        setDoc(ref, {
          name: payload.name.trim(),
          type: payload.type,
          emoji: payload.emoji || '🏷️',
          color: payload.color || '#64748B',
          createdAt: serverTimestamp(),
        }),
      );
      return ref.id;
    },
    [uid],
  );

  const updateCategory = useCallback(
    async (id, payload) => {
      if (!uid) return;
      await settle(
        updateDoc(doc(db, 'users', uid, 'categories', id), {
          name: payload.name.trim(),
          type: payload.type,
          emoji: payload.emoji || '🏷️',
          color: payload.color,
        }),
      );
    },
    [uid],
  );

  const deleteCategory = useCallback(
    async (id) => {
      if (!uid) return;
      await settle(deleteDoc(doc(db, 'users', uid, 'categories', id)));
    },
    [uid],
  );

  // ---------- Wallets ----------
  const addWallet = useCallback(
    async (payload) => {
      if (!uid) return;
      const ref = doc(col(uid, 'wallets'));
      await settle(
        setDoc(ref, {
          name: payload.name.trim(),
          icon: payload.icon || 'account_balance_wallet',
          color: payload.color || '#64748B',
          balance: Number(payload.balance) || 0,
          createdAt: serverTimestamp(),
        }),
      );
      return ref.id;
    },
    [uid],
  );

  const updateWallet = useCallback(
    async (id, payload) => {
      if (!uid) return;
      await settle(updateDoc(doc(db, 'users', uid, 'wallets', id), { name: payload.name.trim(), icon: payload.icon, color: payload.color }));
    },
    [uid],
  );

  const deleteWallet = useCallback(
    async (id) => {
      if (!uid) return;
      await settle(deleteDoc(doc(db, 'users', uid, 'wallets', id)));
    },
    [uid],
  );

  const transferBetweenWallets = useCallback(
    async ({ fromWalletId, toWalletId, amount, note, date }) => {
      if (!uid) return;
      const batch = writeBatch(db);
      const amt = Number(amount);
      batch.update(doc(db, 'users', uid, 'wallets', fromWalletId), { balance: increment(-amt) });
      batch.update(doc(db, 'users', uid, 'wallets', toWalletId), { balance: increment(amt) });
      batch.set(doc(col(uid, 'transactions')), {
        type: 'transfer',
        amount: amt,
        fromWalletId,
        toWalletId,
        date: Timestamp.fromDate(new Date(date || Date.now())),
        note: (note || '').trim(),
        createdAt: serverTimestamp(),
      });
      await settle(batch.commit());
    },
    [uid],
  );

  // ---------- Derived selectors ----------
  const currentMonthKey = monthKey(new Date());

  const stats = useMemo(() => {
    const realTx = transactions.filter((tx) => tx.type === 'income' || tx.type === 'expense');
    const totalBalance = wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
    const now = new Date();
    // Build the previous month from its first day - setMonth(-1) overflows on the 29th-31st.
    const lastMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const todayKey = dayKey(now);

    const thisMonth = [];
    const sums = { lastIncome: 0, lastExpense: 0, todayIncome: 0, todayExpense: 0, monthIncome: 0, monthExpense: 0 };
    realTx.forEach((tx) => {
      const mk = monthKey(tx.date);
      const isIncome = tx.type === 'income';
      if (mk === currentMonthKey) {
        thisMonth.push(tx);
        sums[isIncome ? 'monthIncome' : 'monthExpense'] += tx.amount;
        if (dayKey(tx.date) === todayKey) sums[isIncome ? 'todayIncome' : 'todayExpense'] += tx.amount;
      } else if (mk === lastMonthKey) {
        sums[isIncome ? 'lastIncome' : 'lastExpense'] += tx.amount;
      }
    });

    return {
      totalBalance,
      monthIncome: sums.monthIncome,
      monthExpense: sums.monthExpense,
      lastMonthIncome: sums.lastIncome,
      lastMonthExpense: sums.lastExpense,
      todayIncome: sums.todayIncome,
      todayExpense: sums.todayExpense,
      thisMonthTx: thisMonth,
    };
  }, [transactions, wallets, currentMonthKey]);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const walletById = useMemo(() => new Map(wallets.map((w) => [w.id, w])), [wallets]);
  const getCategory = useCallback((id) => categoryById.get(id), [categoryById]);
  const getWallet = useCallback((id) => walletById.get(id), [walletById]);

  const value = useMemo(
    () => ({
      transactions,
      categories,
      wallets,
      loading,
      stats,
      getCategory,
      getWallet,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      importTransactions,
      importCategories,
      addCategory,
      updateCategory,
      deleteCategory,
      addWallet,
      updateWallet,
      deleteWallet,
      transferBetweenWallets,
    }),
    [
      transactions, categories, wallets, loading, stats, getCategory, getWallet,
      addTransaction, updateTransaction, deleteTransaction, importTransactions, importCategories,
      addCategory, updateCategory, deleteCategory, addWallet, updateWallet, deleteWallet, transferBetweenWallets,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
