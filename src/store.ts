import { UpdateResult } from './model';

type StoreSubscription = {
  listeners: StoreListener[];
  transactionCount: number;
};

type StoreListener = (transactionCount: number, keys: UpdateResult) => void;

class Store {
  private static db: IDBDatabase;
  public static subscriptions: Record<string, StoreSubscription> = {};
  public static _isDevelopment = false;
  public static setDB = (db: typeof Store.db): void => {
    Store.db = db;
  };

  public static getDB = (): typeof Store.db => Store.db;

  public static subscribe = (
    storeName: string,
    listener: StoreListener,
  ): (() => void) => {
    if (!Store.subscriptions[storeName]) {
      Store.subscriptions[storeName] = { transactionCount: 0, listeners: [] };
    }
    Store.subscriptions[storeName].listeners.push(listener);

    function unsubscribe() {
      Store.subscriptions[storeName].listeners = Store.subscriptions[
        storeName
      ].listeners.filter((l) => l !== listener);
    }

    return unsubscribe;
  };

  public static notify = (storeName: string, keys?: UpdateResult): void => {
    if (Store.subscriptions[storeName] === undefined) {
      return;
    }
    const { listeners, transactionCount } = Store.subscriptions[storeName];
    Store.subscriptions[storeName].transactionCount = transactionCount + 1;
    if (!listeners) {
      return;
    }
    listeners.forEach((listener) =>
      listener(Store.subscriptions[storeName].transactionCount, keys),
    );
  };

  public static wake = (): void => {
    const storeNames = Object.keys(Store.subscriptions);
    storeNames.forEach((storeName) => {
      Store.notify(storeName);
    });
  };
}

export default Store;

export function subscribe(
  storeName: string,
  listener: (keys: UpdateResult | UpdateResult[]) => void,
) {
  const _listener = (_: number, keys: UpdateResult) => listener(keys);
  return Store.subscribe(storeName, _listener);
}

export function close(): void {
  const db = Store.getDB();
  db.close();
}
