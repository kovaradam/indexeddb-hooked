import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Config } from './model';
import { openDB } from './open';
import Store from './store';

type Props = { config: Config };

export type Context = {
  db: IDBDatabase | null;
  triggerUpdate: (storeName: string) => void;
  transactionCountStore: Record<string, number>;
};

export const DBContext = React.createContext<Context | null>(null);
DBContext.displayName = 'ReactiveDBContext';

const IndexedDBProvider: React.FC<Props> = ({ config, children }) => {
  const [db, setDB] = useState<IDBDatabase | null>(null);
  const [transactionCountStore, setTransactionCount] = useState(
    createTransactionStore(config),
  );

  const triggerUpdate = useCallback(
    (storeName: string) => {
      setTransactionCount((prevState) =>
        incrementStoreTransactionCount(prevState, storeName),
      );
    },
    [setTransactionCount],
  );

  const contextValue = useMemo(
    () => ({
      db,
      triggerUpdate,
      transactionCountStore,
    }),
    [triggerUpdate, db, transactionCountStore, config],
  );

  const onOpen = useCallback(
    (db: IDBDatabase) => {
      Store.setTriggerUpdate(triggerUpdate);
      setDB(db);
    },
    [setDB, triggerUpdate],
  );

  useEffect(() => {
    openDB(config)
      .then((result) => onOpen(result))
      .catch((error) => console.log(error));
  }, [config, onOpen]);

  return <DBContext.Provider value={contextValue}>{children}</DBContext.Provider>;
};

export default IndexedDBProvider;

function createTransactionStore(config: Config): Record<string, number> {
  const store: ReturnType<typeof createTransactionStore> = {};
  config.objectStores.forEach(({ name }) => (store[name] = 0));
  return store;
}

function incrementStoreTransactionCount(
  prevState: Record<string, number>,
  storeName: string,
): Record<string, number> {
  const newState = { ...prevState };
  newState[storeName] = ++prevState[storeName];
  return newState;
}
