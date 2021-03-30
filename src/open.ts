import { Config, ObjectStoreParams } from './model';
import Store from './store';
import { createPromiseWithOutsideResolvers, usesInlineKeys } from './utils';

const open = (config: Config): Promise<IDBDatabase> => {
  const name = config.name || 'indexeddb-hooked';
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
    db.onerror = (event: Event): void => {
      throw new Error((event.target as IDBRequest)?.error + '');
    };
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

  params.forEach(({ name, options, indexes, data, dataKey }) => {
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
        if (usesInlineKeys(dataObjectStore)) {
          dataObjectStore.add(item);
        } else {
          if (!dataKey) {
            throw new Error('Store uses out-of-line key and dataKey was not provided');
          }
          const itemKey = (item as { [key: string]: IDBValidKey })[dataKey];
          if (!itemKey) {
            throw new Error('DataKey does not exist on provided object');
          }
          dataObjectStore.add(item, itemKey);
        }
      });
    });

    // Use transaction oncomplete to make sure the objectStore creation is
    // finished before adding data into it.
    objectStore.transaction.oncomplete = (_: Event): void => {
      writers.forEach((write) => write());
    };
  });
}

export function close(): void {
  const db = Store.getDB();
  db.close();
}
