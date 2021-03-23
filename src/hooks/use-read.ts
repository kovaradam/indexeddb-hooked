import { useRef, useState } from 'react';
import { ReadParams as BaseReadParams, DBRecord } from '../model';
import { asyncRead } from '../operators/read';
import { compareStringifiedObjects } from '../utils';
import useDB from './use-db';

type ReadResult<T> = { value: T | null; transactionCount: number };

interface UseReadParams<T> extends BaseReadParams<T> {}

function useRead<T extends DBRecord | DBRecord[]>(
  storeName: string,
  params: UseReadParams<T> & { key: IDBValidKey; returnWithKey: true },
): { value: T; key: IDBValidKey } | null;

function useRead<T extends DBRecord | DBRecord[]>(
  storeName: string,
  params: UseReadParams<T> & { key: IDBValidKey },
): T | null;

function useRead<T extends DBRecord | DBRecord[]>(
  storeName: string,
  params: UseReadParams<T> & { returnWithKey: true },
): { value: T; key: IDBValidKey }[] | null;

function useRead<T extends DBRecord | DBRecord[]>(
  storeName: string,
  params?: UseReadParams<T>,
): T[] | null;

function useRead<T extends DBRecord | DBRecord[]>(
  storeName: string,
  params?: UseReadParams<T>,
): T | null {
  const { db, transactionCountStore } = useDB();
  const transactionCount = transactionCountStore[storeName];
  const [lastResult, setLastResult] = useState<ReadResult<T | null>>(
    createReadResult(null, transactionCount),
  );

  const persistedParams = useRef(params);
  const isParamChange = useRef(params).current !== params;

  if (isParamChange) {
    persistedParams.current = params;
  }

  if (!db) return null;

  if (
    !isParamChange &&
    lastResult.value &&
    transactionCount === lastResult.transactionCount
  ) {
    return lastResult.value;
  }

  function onSuccess(result: T, _: Event): void {
    const compare =
      typeof result === 'object'
        ? compareStringifiedObjects
        : (a: unknown, b: unknown): boolean => a === b;
    if (
      !compare(
        result as Record<string, unknown>,
        lastResult.value as Record<string, unknown>,
      )
    ) {
      const newResult = createReadResult<T>(result as T, transactionCount);
      setLastResult(newResult);
    }
  }

  function onError(event: Event): void {
    throw new Error(event.type);
  }

  asyncRead<T>(storeName, { ...params, db, onSuccess, onError });

  return lastResult.value;
}

export default useRead;

function createReadResult<T>(value: T | null, transactionCount: number): ReadResult<T> {
  return { value, transactionCount };
}
