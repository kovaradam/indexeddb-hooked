type StoreRecord = {
  triggers: ((transactionCount: number) => void)[];
  transactionCount: number;
};

class Store {
  private static db: IDBDatabase;
  public static triggers: Record<string, StoreRecord> = {};

  public static _isDevelopment = false;

  public static setDB = (db: typeof Store.db): void => {
    Store.db = db;
  };

  public static getDB = (): typeof Store.db => Store.db;

  public static subscribe = (
    storeName: string,
    trigger: (count: number) => void,
  ): (() => void) => {
    if (!Store.triggers[storeName]) {
      Store.triggers[storeName] = { transactionCount: 0, triggers: [] };
    }
    Store.triggers[storeName].triggers.push(trigger);
    return () => {
      console.log(Store.triggers[storeName].triggers.length);
      Store.triggers[storeName].triggers = Store.triggers[storeName].triggers.filter(
        (t) => t !== trigger,
      );
      console.log(Store.triggers[storeName].triggers.length);
    };
  };

  public static trigger = (storeName: string): void => {
    const { triggers, transactionCount } = Store.triggers[storeName];
    Store.triggers[storeName].transactionCount = transactionCount + 1;
    if (!triggers) {
      return;
    }
    triggers.forEach((trigger) => trigger(Store.triggers[storeName].transactionCount));
  };

  public static wake = (): void => {
    const storeNames = Object.keys(Store.triggers);
    storeNames.forEach((storeName) => {
      Store.trigger(storeName);
    });
  };
}

export default Store;
