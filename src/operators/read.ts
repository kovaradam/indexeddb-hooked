import { ReadParams as BaseReadParams, ResultWithKey } from '../model';
import Store from '../store';
import { createPromiseWithOutsideResolvers } from '../utils';

type Result<T> = T | ResultWithKey<T> | null;

interface AsyncReadParams<T> extends BaseReadParams<T> {
  db: IDBDatabase | null;
  onSuccess: (result: Result<T> | Result<T>[], event: Event) => void;
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
      onSuccess(request.result, event);
    };
  } else if (params?.key) {
    const request = params.index
      ? objectStore.index(params.index).get(params.key)
      : objectStore.get(params.key);
    request.onsuccess = (event: Event): void => {
      onSuccess(createResult(request.result, params.key), event);
    };
  } else {
    const result: Result<T>[] = [];
    const keyRange = params.keyRange || null;
    const direction = params.direction || defaultDirection;
    const request = objectStore.openCursor(keyRange, direction);
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

  transaction.onerror = (event: Event): void => {
    params.onError && params.onError(event);
  };

  function createResult<T>(value: T, key: IDBValidKey): Result<T> {
    if (!value) {
      return null;
    }
    if (params.returnWithKey) {
      return { value, key };
    }
    return value;
  }
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
