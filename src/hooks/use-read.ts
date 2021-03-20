import { useState } from 'react';
import { BaseReadParams, DBRecord } from '../model';
import { asyncRead } from '../operators/read';
import { compareStringifiedObjects } from '../utils';
import useDB from './use-db';

interface UseReadParams extends BaseReadParams {
  keepResults?: boolean;
}

type ReadResult<T> = { value: T | null; transactionCount: number };

function useRead<T extends DBRecord | DBRecord[]>(
  storeName: string,
  params: UseReadParams,
): T | null;

function useRead<T extends DBRecord | DBRecord[]>(
  storeName: string,
  params?: UseReadParams,
): T[] | null;

function useRead<T extends DBRecord | DBRecord[]>(
  storeName: string,
  params?: UseReadParams,
): T | null {
  const { db, transactionCountStore, keepLastReadResults } = useDB();
  const transactionCount = transactionCountStore[storeName];
  const [lastResult, setLastResult] = useState<ReadResult<T | null>>(
    createReadResult(null, transactionCount),
  );

  if (!db) return null;
  if (lastResult.value && transactionCount === lastResult.transactionCount) {
    return lastResult.value;
  }

  if (!keepLastReadResults && !params?.keepResults) {
    lastResult.value = null;
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
    console.log(event.type);
  }

  asyncRead<T>(storeName, { ...params, db, onSuccess, onError });

  return lastResult.value;
}

export default useRead;

function createReadResult<T>(value: T | null, transactionCount: number): ReadResult<T> {
  return { value, transactionCount };
}
