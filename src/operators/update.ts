import { DBRecord, UpdateData, Updater } from '../model';
import Store from '../store';
import { createPromiseWithOutsideResolvers } from '../utils';

type AsyncUpdateParams = {
  data: UpdateData | UpdateData[];
  onComplete: (event: Event) => void;
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

  transaction.oncomplete = (event: Event): void => {
    onComplete(event);
  };
  if ((data as UpdateData[]).length === undefined) {
    data = [data as UpdateData];
  }
  (data as UpdateData[]).forEach((item) => {
    if ((item as UpdateData).value !== null) {
      put(item as PutUpdateData, objectStore);
    } else {
      deleteItem(item as UpdateData, objectStore);
    }
  });
}

const update: Updater<Promise<null>> = (
  storeName: string,
  data: UpdateData | UpdateData[],
  renderOnUpdate = true,
) => {
  const [promise, resolve, reject] = createPromiseWithOutsideResolvers<null, string>();
  function onComplete(): void {
    if (renderOnUpdate !== false) {
      Store.trigger(storeName);
    }
    resolve(null);
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

function put(data: PutUpdateData, objectStore: IDBObjectStore): void {
  const { value, key, replace } = data;

  if (!key) {
    objectStore.put(value);
    return;
  }
  if (replace) {
    if (objectStore.keyPath !== null) {
      objectStore.put(value);
    } else {
      objectStore.put(value, key as IDBValidKey);
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
      objectStore.put(DBObject, key as IDBValidKey);
    } else {
      objectStore.put(DBObject);
    }
  };
}

function deleteItem(data: UpdateData, objectStore: IDBObjectStore): void {
  if (data.key === undefined) {
    throw new Error(`Error: Can't delete item without providing its key!`);
  }
  objectStore.delete(data.key);
}
