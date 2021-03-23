import { ReadParams as BaseReadParams } from '../model';
import Store from '../store';
import { createPromiseWithOutsideResolvers } from '../utils';

interface AsyncReadParams<T> extends BaseReadParams<T> {
  db: IDBDatabase | null;
  onSuccess: (result: T, event: Event) => void;
  onError?: (event: Event) => void;
}

const defaultDirection = 'next';

export function asyncRead<T>(storeName: string, params: AsyncReadParams<T>): void {
  const { db, onSuccess } = params;
  if (!db) {
    throw new Error('Error: database is not open');
  }

  const transaction = db.transaction(storeName, 'readonly');
  const objectStore = transaction.objectStore(storeName);

  if (!params) {
    const request = objectStore.getAll();
    request.onsuccess = (event: Event): void => {
      onSuccess((request.result as unknown) as T, event);
    };
  } else if (params?.key) {
    const request = params.index
      ? objectStore.index(params.index).get(params.key)
      : objectStore.get(params.key);
    request.onsuccess = (event: Event): void => {
      onSuccess(request.result, event);
    };
  } else {
    const result: T[] = [];
    const keyRange = params.keyRange || null;
    const direction = params.direction || defaultDirection;
    const request = objectStore.openCursor(keyRange, direction);
    request.onsuccess = (event: Event): void => {
      const cursor = (event.target as IDBRequest)?.result;
      if (cursor) {
        if (params.filter && !params.filter(cursor.value)) {
          cursor.continue();
        } else {
          const value = params.returnWithKey
            ? { value: cursor.value, key: cursor.key }
            : cursor.value;
          result.push(value);
          cursor.continue();
        }
      } else {
        onSuccess((result as unknown) as T, event);
      }
    };
  }

  transaction.onerror = (event: Event): void => {
    params.onError && params.onError(event);
  };
}

interface ReadParams<T> extends BaseReadParams<T> {
  triggerUpdate?: boolean;
}

export default function read<T>(storeName: string, params?: ReadParams<T>): Promise<T> {
  const [promise, resolve, reject] = createPromiseWithOutsideResolvers<T, string>();

  function onSuccess(result: T, _: Event): void {
    resolve(result);
  }

  function onError(event: Event): void {
    reject(event.type);
  }

  asyncRead(storeName, { ...params, db: Store.getDB(), onSuccess, onError });
  return promise;
}

function returnWithKey<T>(value: T, key: IDBValidKey): { value: T; key: IDBValidKey } {
  return { value, key };
}
