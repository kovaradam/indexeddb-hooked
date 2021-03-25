import { useCallback, useRef, useState } from 'react';
import {
  ReadParams as BaseReadParams,
  DBRecord,
  ReadResult,
  ResultWithKey,
} from '../model';
import { asyncRead } from '../operators/read';
import { compareStringifiedObjects } from '../utils';
import useDB from './use-db';

type ResultWithTransactionCount<T> = {
  value: ReadResult<T> | null;
  transactionCount: number;
};

interface UseReadParams<T> extends BaseReadParams<T> {}

function useRead<T extends DBRecord>(
  storeName: string,
  params: UseReadParams<T> & { key: IDBValidKey; returnWithKey: true },
): ResultWithKey<T> | null;

function useRead<T extends DBRecord>(
  storeName: string,
  params: UseReadParams<T> & { key: IDBValidKey },
): T | null;

function useRead<T extends DBRecord>(
  storeName: string,
  params: UseReadParams<T> & { returnWithKey: true },
): ResultWithKey<T>[] | null;

function useRead<T extends DBRecord>(
  storeName: string,
  params?: UseReadParams<T>,
): T[] | null;

function useRead<T extends DBRecord>(
  storeName: string,
  params?: UseReadParams<T>,
): ReadResult<T> | null {
  const { db, transactionCountStore } = useDB();
  const transactionCount = transactionCountStore[storeName];
  const [lastResult, setLastResult] = useState(
    createResultWithTransactionCount<T>(null, transactionCount),
  );

  const persistedParams = useRef(params);
  const isParamChange = useRef(params).current !== params;

  if (isParamChange) {
    persistedParams.current = params;
  }

  const onSuccess = useCallback(
    (result: ReadResult<T>, _: Event) => {
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
        const newResult = createResultWithTransactionCount<T>(result, transactionCount);
        setLastResult(newResult);
      }
    },
    [lastResult.value, transactionCount],
  );

  if (!db) return null;

  if (
    !isParamChange &&
    lastResult.value &&
    transactionCount === lastResult.transactionCount
  ) {
    return lastResult.value;
  }

  function onError(event: Event): void {
    throw new Error(event.type);
  }

  asyncRead<T>(storeName, { ...params, db, onSuccess, onError });

  return lastResult.value;
}

export default useRead;

function createResultWithTransactionCount<T>(
  value: ReadResult<T> | null,
  transactionCount: number,
): ResultWithTransactionCount<T> {
  return { value, transactionCount };
}
