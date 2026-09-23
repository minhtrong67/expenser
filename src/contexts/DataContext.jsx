import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  increment,
  serverTimestamp,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_WALLETS,
} from '../utils/defaults';
import { monthKey, dayKey } from '../utils/format';

const DataContext = createContext(null);

function col(uid, name) {
  return collection(db, 'users', uid, name);
}

function toDate(val) {
  if (!val) return new Date();
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val);
}


export function DataProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid || null;

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const seededRef = useRef(false);

  // Seed defaults for a brand-new user
  useEffect(() => {
    if (!uid) return;
    seededRef.current = false;
    (async () => {
      try {
        const catSnap = await getDocs(col(uid, 'categories'));
        const walSnap = await getDocs(col(uid, 'wallets'));
        if (catSnap.empty && !seededRef.current) {
          seededRef.current = true;
          const batch = writeBatch(db);
          DEFAULT_EXPENSE_CATEGORIES.forEach((c) => {
            const ref = doc(col(uid, 'categories'));
            batch.set(ref, { ...c, type: 'expense', createdAt: serverTimestamp() });
          });
          DEFAULT_INCOME_CATEGORIES.forEach((c) => {
            const ref = doc(col(uid, 'categories'));
            batch.set(ref, { ...c, type: 'income', createdAt: serverTimestamp() });
          });
          await batch.commit();
        }
        if (walSnap.empty) {
          const batch2 = writeBatch(db);
          DEFAULT_WALLETS.forEach((w) => {
            const ref = doc(col(uid, 'wallets'));
            batch2.set(ref, { ...w, createdAt: serverTimestamp() });
          });
          await batch2.commit();
        }
      } catch (e) {
        console.error('Seed error', e);
      }
    })();
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setTransactions([]);
      setCategories([]);
      setWallets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubs = [];
    unsubs.push(
      onSnapshot(query(col(uid, 'transactions'), orderBy('date', 'desc')), (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data(), date: toDate(d.data().date) })));
        setLoading(false);
      }, () => setLoading(false))
    );
    unsubs.push(
      onSnapshot(col(uid, 'categories'), (snap) => {
        setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      })
    );
    unsubs.push(
      onSnapshot(col(uid, 'wallets'), (snap) => {
        setWallets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [uid]);

  // ---------- Transactions ----------
  const addTransaction = useCallback(async (payload) => {
    if (!uid) return;
    const ref = await addDoc(col(uid, 'transactions'), {
      type: payload.type,
      amount: Number(payload.amount),
      categoryId: payload.categoryId,
      walletId: payload.walletId,
      date: Timestamp.fromDate(new Date(payload.date)),
      note: (payload.note || '').trim(),
      createdAt: serverTimestamp(),
    });
    const sign = payload.type === 'income' ? 1 : -1;
    await updateDoc(doc(db, 'users', uid, 'wallets', payload.walletId), {
      balance: increment(sign * Number(payload.amount)),
    });
    return ref.id;
  }, [uid]);

  const updateTransaction = useCallback(async (id, payload, previous) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'transactions', id), {
      type: payload.type,
      amount: Number(payload.amount),
      categoryId: payload.categoryId,
      walletId: payload.walletId,
      date: Timestamp.fromDate(new Date(payload.date)),
      note: (payload.note || '').trim(),
    });
    // revert previous wallet effect
    if (previous) {
      const prevSign = previous.type === 'income' ? -1 : 1;
      await updateDoc(doc(db, 'users', uid, 'wallets', previous.walletId), {
        balance: increment(prevSign * Number(previous.amount)),
      });
    }
    const sign = payload.type === 'income' ? 1 : -1;
    await updateDoc(doc(db, 'users', uid, 'wallets', payload.walletId), {
      balance: increment(sign * Number(payload.amount)),
    });
  }, [uid]);

  const deleteTransaction = useCallback(async (tx) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'transactions', tx.id));
    const revertSign = tx.type === 'income' ? -1 : 1;
    await updateDoc(doc(db, 'users', uid, 'wallets', tx.walletId), {
      balance: increment(revertSign * Number(tx.amount)),
    });
  }, [uid]);

  const deleteTransactionsBulk = useCallback(async (txs) => {
    if (!uid || !txs.length) return;
    const batch = writeBatch(db);
    const walletDeltas = {};
    txs.forEach((tx) => {
      batch.delete(doc(db, 'users', uid, 'transactions', tx.id));
      const revertSign = tx.type === 'income' ? -1 : 1;
      walletDeltas[tx.walletId] = (walletDeltas[tx.walletId] || 0) + revertSign * Number(tx.amount);
    });
    Object.entries(walletDeltas).forEach(([walletId, delta]) => {
      batch.update(doc(db, 'users', uid, 'wallets', walletId), { balance: increment(delta) });
    });
    await batch.commit();
  }, [uid]);

  // ---------- Categories ----------
  const addCategory = useCallback(async (payload) => {
    if (!uid) return;
    const ref = await addDoc(col(uid, 'categories'), {
      name: payload.name.trim(),
      type: payload.type,
      emoji: payload.emoji || '🏷️',
      color: payload.color || '#64748B',
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }, [uid]);

  const updateCategory = useCallback(async (id, payload) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'categories', id), {
      name: payload.name.trim(),
      type: payload.type,
      emoji: payload.emoji || '🏷️',
      color: payload.color,
    });
  }, [uid]);

  const deleteCategory = useCallback(async (id) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'categories', id));
  }, [uid]);

  // ---------- Wallets ----------
  const addWallet = useCallback(async (payload) => {
    if (!uid) return;
    const ref = await addDoc(col(uid, 'wallets'), {
      name: payload.name.trim(),
      icon: payload.icon || 'account_balance_wallet',
      color: payload.color || '#64748B',
      balance: Number(payload.balance) || 0,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }, [uid]);

  const updateWallet = useCallback(async (id, payload) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'wallets', id), {
      name: payload.name.trim(),
      icon: payload.icon,
      color: payload.color,
    });
  }, [uid]);

  const deleteWallet = useCallback(async (id) => {
    if (!uid) return;
    await deleteDoc(doc(db, 'users', uid, 'wallets', id));
  }, [uid]);

  const transferBetweenWallets = useCallback(async ({ fromWalletId, toWalletId, amount, note, date }) => {
    if (!uid) return;
    const batch = writeBatch(db);
    const amt = Number(amount);
    batch.update(doc(db, 'users', uid, 'wallets', fromWalletId), { balance: increment(-amt) });
    batch.update(doc(db, 'users', uid, 'wallets', toWalletId), { balance: increment(amt) });
    const ref = doc(col(uid, 'transactions'));
    batch.set(ref, {
      type: 'transfer',
      amount: amt,
      fromWalletId,
      toWalletId,
      date: Timestamp.fromDate(new Date(date || Date.now())),
      note: (note || '').trim(),
      createdAt: serverTimestamp(),
    });
    await batch.commit();
  }, [uid]);

  // ---------- Derived selectors ----------
  const currentMonthKey = monthKey(new Date());

  const stats = useMemo(() => {
    const realTx = transactions.filter((t) => t.type === 'income' || t.type === 'expense');
    const totalBalance = wallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);
    const thisMonth = realTx.filter((t) => monthKey(t.date) === currentMonthKey);
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthKey = monthKey(lastMonthDate);
    const lastMonth = realTx.filter((t) => monthKey(t.date) === lastMonthKey);
    const todayKey = dayKey(new Date());
    const today = realTx.filter((t) => dayKey(t.date) === todayKey);

    const sum = (arr, type) => arr.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0);

    return {
      totalBalance,
      monthIncome: sum(thisMonth, 'income'),
      monthExpense: sum(thisMonth, 'expense'),
      lastMonthIncome: sum(lastMonth, 'income'),
      lastMonthExpense: sum(lastMonth, 'expense'),
      todayIncome: sum(today, 'income'),
      todayExpense: sum(today, 'expense'),
      thisMonthTx: thisMonth,
    };
  }, [transactions, wallets, currentMonthKey]);

  const getCategory = useCallback((id) => categories.find((c) => c.id === id), [categories]);
  const getWallet = useCallback((id) => wallets.find((w) => w.id === id), [wallets]);

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
      deleteTransactionsBulk,
      addCategory,
      updateCategory,
      deleteCategory,
      addWallet,
      updateWallet,
      deleteWallet,
      transferBetweenWallets,
    }),
    [
      transactions, categories, wallets, loading, stats,
      getCategory, getWallet, addTransaction, updateTransaction, deleteTransaction,
      deleteTransactionsBulk, addCategory, updateCategory, deleteCategory,
      addWallet, updateWallet, deleteWallet, transferBetweenWallets,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
