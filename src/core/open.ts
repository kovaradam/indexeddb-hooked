import { Config, ObjectStoreParams } from '../model';
import Store from '../store';
import { createPromiseWithOutsideResolvers } from '../utils';

const open = (config: Config): Promise<IDBDatabase> => {
  const name = config.name || 'IDB_HOOKED';
  const version = config.version || 1;
  const DBOpenRequest = window.indexedDB.open(name, version);

  Store._isDevelopment = config._isDevelopment || false;

  const [promise, promiseResolve, promiseReject] = createPromiseWithOutsideResolvers<
    IDBDatabase,
    string
  >();

  if (!window.indexedDB) {
    promiseReject(
      "Your browser doesn't support a stable version of IndexedDB. Some features will not be available.",
    );
  }

  DBOpenRequest.onsuccess = (event: Event): void => {
    const db = (event.target as IDBOpenDBRequest).result;
    db.onerror = throwError;
    Store.setDB(db);
    Store.wake();
    promiseResolve(db);
    if (config.onOpenSuccess) {
      config.onOpenSuccess(event);
    }
  };

  DBOpenRequest.onerror = (event: Event): void => {
    promiseReject((event.target as IDBOpenDBRequest)?.error + '');
    if (config.onOpenError) {
      config.onOpenError(event);
    }
  };

  let onUpgradeNeeded: (event: IDBVersionChangeEvent) => void;

  if (config.onUpgradeNeeded !== undefined) {
    onUpgradeNeeded = (event: IDBVersionChangeEvent) =>
      config.onUpgradeNeeded!(event, config.objectStores);
  } else {
    onUpgradeNeeded = (_: IDBVersionChangeEvent): void => {
      if (config.objectStores.some(({ name }) => !name)) {
        promiseReject(
          'Error: Object store parameters were not provided on version change',
        );
        return;
      }
      upgradeStores(config.objectStores, DBOpenRequest);
    };
  }
  DBOpenRequest.onupgradeneeded = onUpgradeNeeded;

  return promise;
};

export default open;

function upgradeStores(
  params: ObjectStoreParams[],
  DBOpenRequest: IDBOpenDBRequest,
): void {
  const { result: db, transaction } = DBOpenRequest;

  let objectStore: IDBObjectStore;
  const writers: (() => void)[] = [];

  params.forEach(({ name, options, indexes, data }) => {
    if (db.objectStoreNames.contains(name)) {
      if (!transaction) return;
      objectStore = transaction.objectStore(name);
    } else {
      objectStore = db.createObjectStore(name, options);
    }

    indexes?.forEach(({ name, keyPath, options }) => {
      if (objectStore.indexNames.contains(name)) {
        objectStore.deleteIndex(name);
      }
      objectStore.createIndex(name, keyPath, options);
    });

    if (!data) return;
    objectStore.clear();
    writers.push((): void => {
      // Store values in the newly created objectStore.
      const dataObjectStore = db.transaction(name, 'readwrite').objectStore(name);
      data.forEach((item) => {
        dataObjectStore.add(item).onerror = throwError;
      });
    });

    // Use transaction oncomplete to make sure the objectStore creation is
    // finished before adding data into it.
    objectStore.transaction.oncomplete = (_: Event): void => {
      writers.forEach((write) => write());
    };
  });
}

function throwError(event: Event) {
  throw new Error((event.target as IDBRequest)?.error + '');
}
