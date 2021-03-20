class Store {
  private static db: IDBDatabase;
  public static triggerUpdate: (storeName: string) => void;

  public static setDB = (db: typeof Store.db): void => {
    Store.db = db;
  };

  public static getDB = (): typeof Store.db => Store.db;

  public static setTriggerUpdate = (triggerUpdate: typeof Store.triggerUpdate): void => {
    Store.triggerUpdate = triggerUpdate;
  };
}

export default Store;
