import { DBRecord, UpdateData, UpdateResult } from '../model';
import Store from '../store';

type AsyncUpdateParams<T> = {
  data: UpdateData<T> | UpdateData<T>[];
  onComplete: (event: Event, keys: UpdateResult) => void;
  onError?: (event: Event) => void;
  renderOnUpdate?: boolean;
};

export function asyncUpdate<T extends DBRecord>(
  storeName: string,
  params: AsyncUpdateParams<T>,
): void {
  const { onComplete, renderOnUpdate } = params;
  let { data } = params;
  const db = Store.getDB();

  if (!db) {
    throw new Error('Error: database is not open');
  }

  let transaction: IDBTransaction, objectStore: IDBObjectStore;
  try {
    transaction = db.transaction(storeName, 'readwrite');
    objectStore = transaction.objectStore(storeName);
  } catch (error) {
    onError(error);
    return;
  }
  const returnKeys: IDBValidKey[] = [];
  const isDataArray = (data as UpdateData<T>[]).length !== undefined;

  transaction.onerror = onError;

  transaction.oncomplete = (event: Event): void => {
    const keys = isDataArray ? returnKeys : returnKeys[0];
    if (renderOnUpdate !== false) {
      Store.notify(storeName, keys);
    }
    onComplete(event, keys);
  };

  if (!isDataArray) {
    data = [data as UpdateData<T>];
  }
  (data as UpdateData<T>[]).forEach((item) => {
    let request: IDBRequest;
    if ((item as UpdateData<T>).value !== null) {
      request = put(item as PutUpdateData<T>, objectStore, returnKeys);
    } else {
      if (item.key === undefined) {
        transaction.abort();
        onError(
          'Error: Cannot delete item without providing its key! Aborting transaction' as any,
        );
        return;
      }
      request = objectStore.delete(item.key);
      request.onsuccess = (event) => returnKeys.push((event.target as IDBRequest).result);
    }
    request.onerror = onError;
  });

  function onError(event: Event): void {
    if (params.onError) {
      params.onError(event);
    }
  }
}

interface PutUpdateData<T> extends UpdateData<T> {
  value: T;
}

function put<T extends DBRecord>(
  data: PutUpdateData<T>,
  objectStore: IDBObjectStore,
  returnKeys: IDBValidKey[],
): IDBRequest {
  const { value, key, replace } = data;

  function _put(value: T, key?: IDBValidKey) {
    const request = objectStore.put(value, key);
    request.onsuccess = (event) => returnKeys.push((event.target as IDBRequest).result);
    return request;
  }

  if (key === undefined) {
    return _put(value);
  }
  if (replace) {
    if (objectStore.keyPath !== null) {
      return _put(value);
    } else {
      return _put(value, key as IDBValidKey);
    }
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

  return request;
}
