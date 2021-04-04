import { DBRecord, UpdateData, UpdateResult } from '../model';
import Store from '../store';

type AsyncUpdateParams<T> = {
  data: UpdateData<T> | UpdateData<T>[];
  onComplete: (event: Event, keys: UpdateResult) => void;
  onError?: (event: Event) => void;
};

export function asyncUpdate<T extends DBRecord>(
  storeName: string,
  params: AsyncUpdateParams<T>,
): void {
  const { onComplete } = params;
  let { data } = params;
  const db = Store.getDB();

  if (!db) {
    throw new Error('Error: database is not open');
  }

  const transaction = db.transaction(storeName, 'readwrite');
  const objectStore = transaction.objectStore(storeName);

  const returnKeys: IDBValidKey[] = [];
  const isDataArray = (data as UpdateData<T>[]).length !== undefined;

  transaction.onerror = (event: Event): void => {
    params.onError && params.onError(event);
  };

  transaction.oncomplete = (event: Event): void => {
    const keys = isDataArray ? returnKeys : returnKeys[0];
    onComplete(event, keys);
  };

  if (!isDataArray) {
    data = [data as UpdateData<T>];
  }
  (data as UpdateData<T>[]).forEach((item) => {
    if ((item as UpdateData<T>).value !== null) {
      put(item as PutUpdateData<T>, objectStore, returnKeys);
    } else {
      if (item.key === undefined) {
        throw new Error(`Error: Cannot delete item without providing its key!`);
      }
      objectStore.delete(item.key).onsuccess = (event) =>
        returnKeys.push((event.target as IDBRequest).result);
    }
  });
}

interface PutUpdateData<T> extends UpdateData<T> {
  value: T;
}

function put<T extends DBRecord>(
  data: PutUpdateData<T>,
  objectStore: IDBObjectStore,
  returnKeys: IDBValidKey[],
): void {
  const { value, key, replace } = data;

  function _put(value: T, key?: IDBValidKey) {
    objectStore.put(value, key).onsuccess = (event) =>
      returnKeys.push((event.target as IDBRequest).result);
  }

  if (!key) {
    _put(value);
    return;
  }
  if (replace) {
    if (objectStore.keyPath !== null) {
      _put(value);
    } else {
      _put(value, key as IDBValidKey);
    }
    return;
  }

  const request = objectStore.get(key);

  request.onsuccess = (): void => {
    let DBObject = request.result;
    if (DBObject !== undefined && typeof DBObject === 'object') {
      Object.assign(DBObject, value);
    } else {
      DBObject = value;
    }
    if (objectStore.keyPath === null) {
      _put(DBObject, key as IDBValidKey);
    } else {
      _put(DBObject);
    }
  };
}
