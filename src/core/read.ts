import { ReadParams as BaseReadParams, ReadResult } from '../model';
import Store from '../store';

interface AsyncReadParams<T> extends BaseReadParams<T> {
  onSuccess: (result: ReadResult<T>, event: Event) => void;
  onError?: (event: Event) => void;
}

const defaultDirection = 'next';

export function asyncRead<T>(storeName: string, params: AsyncReadParams<T>): void {
  const { onSuccess } = params;
  const db = Store.getDB();

  if (!db) {
    throw new Error('Error: database is not open');
  }

  let transaction: IDBTransaction, objectStore: IDBObjectStore, request: IDBRequest;
  try {
    transaction = db.transaction(storeName, 'readonly');
    objectStore = transaction.objectStore(storeName);
  } catch (error) {
    onError(error);
    return;
  }

  if (!params) {
    request = objectStore.getAll();
    request.onsuccess = (event: Event): void => {
      onSuccess(request.result, event);
    };
  } else if (params?.key) {
    request = params.index
      ? objectStore.index(params.index).get(params.key)
      : objectStore.get(params.key);
    request.onsuccess = (event: Event): void => {
      onSuccess(createResult(request.result, params.key), event);
    };
  } else {
    const result: ReadResult<T> = [];
    const keyRange = params.keyRange || null;
    const direction = params.direction || defaultDirection;
    request = objectStore.openCursor(keyRange, direction);
    request.onsuccess = (event: Event): void => {
      const cursor = (event.target as IDBRequest)?.result;
      if (cursor) {
        if (params.filter && !params.filter(cursor.value)) {
          cursor.continue();
        } else {
          result.push(createResult(cursor.value, cursor.key));
          cursor.continue();
        }
      } else {
        onSuccess(result, event);
      }
    };
  }

  function onError(event: Event): void {
    if (params.onError) {
      params.onError(event);
    }
  }

  transaction.onerror = onError;
  request.onerror = onError;

  function createResult<T>(value: T, key?: IDBValidKey): ReadResult<T> {
    if (value === null || value === undefined) {
      return null;
    }

    if (params.returnWithKey && key !== undefined) {
      return { value, key };
    }
    return value;
  }
}
