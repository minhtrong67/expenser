import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { app } from './firebase';

// Persistent local cache: the app opens instantly from cached data, keeps
// working offline, and syncs queued writes when the connection returns.
// Falls back to the default in-memory cache where IndexedDB is unavailable.
function createDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = createDb();
