type StoreSubscription = {
  triggers: ((transactionCount: number) => void)[];
  transactionCount: number;
};

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
    trigger: (count: number) => void,
  ): (() => void) => {
    if (!Store.subscriptions[storeName]) {
      Store.subscriptions[storeName] = { transactionCount: 0, triggers: [] };
    }
    Store.subscriptions[storeName].triggers.push(trigger);

    function unsubscribe() {
      Store.subscriptions[storeName].triggers = Store.subscriptions[
        storeName
      ].triggers.filter((t) => t !== trigger);
    }

    return unsubscribe;
  };

  public static trigger = (storeName: string): void => {
    const { triggers, transactionCount } = Store.subscriptions[storeName];
    Store.subscriptions[storeName].transactionCount = transactionCount + 1;
    if (!triggers) {
      return;
    }
    triggers.forEach((trigger) =>
      trigger(Store.subscriptions[storeName].transactionCount),
    );
  };

  public static wake = (): void => {
    const storeNames = Object.keys(Store.subscriptions);
    storeNames.forEach((storeName) => {
      Store.trigger(storeName);
    });
  };
}

export default Store;
