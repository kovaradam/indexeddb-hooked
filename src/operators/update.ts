import { DBRecord, UpdateData, Updater, UpdateResult } from '../model';
import Store from '../store';
import { createPromiseWithOutsideResolvers } from '../utils';

type AsyncUpdateParams = {
  data: UpdateData | UpdateData[];
  onComplete: (event: Event, keys: UpdateResult) => void;
  onError?: (event: Event) => void;
};

export function asyncUpdate(storeName: string, params: AsyncUpdateParams): void {
  const { onComplete } = params;
  let { data } = params;
  const db = Store.getDB();

  if (!db) {
    throw new Error('Error: database is not open');
  }

  const transaction = db.transaction(storeName, 'readwrite');
  const objectStore = transaction.objectStore(storeName);

  transaction.onerror = (event: Event): void => {
    params.onError && params.onError(event);
  };
  const returnKeys: IDBValidKey[] = [];
  transaction.oncomplete = (event: Event): void => {
    const keys = returnKeys.length > 1 ? returnKeys : returnKeys[0];
    onComplete(event, keys);
  };
  if ((data as UpdateData[]).length === undefined) {
    data = [data as UpdateData];
  }
  (data as UpdateData[]).forEach((item) => {
    if ((item as UpdateData).value !== null) {
      put(item as PutUpdateData, objectStore, returnKeys);
    } else {
      if (item.key === undefined) {
        throw new Error(`Error: Can't delete item without providing its key!`);
      }
      objectStore.delete(item.key).onsuccess = (event) =>
        returnKeys.push((event.target as IDBRequest).result);
    }
  });
}

const update: Updater<Promise<UpdateResult>> = (
  storeName: string,
  data: UpdateData | UpdateData[],
  renderOnUpdate = true,
) => {
  const [promise, resolve, reject] = createPromiseWithOutsideResolvers<
    UpdateResult,
    string
  >();
  function onComplete(_: Event, keys: UpdateResult): void {
    if (renderOnUpdate !== false) {
      Store.trigger(storeName, keys);
    }
    resolve(keys);
  }
  function onError(event: Event): void {
    reject((event.target as IDBRequest).error?.message || '');
  }
  asyncUpdate(storeName, { data, onComplete, onError });
  return promise;
};

export default update;

interface PutUpdateData extends UpdateData {
  value: DBRecord;
}

function put(
  data: PutUpdateData,
  objectStore: IDBObjectStore,
  returnKeys: IDBValidKey[],
): void {
  const { value, key, replace } = data;

  function _put(value: DBRecord, key?: IDBValidKey) {
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

  request.onsuccess = (_: Event): void => {
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
