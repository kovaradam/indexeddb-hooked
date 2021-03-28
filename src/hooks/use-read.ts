import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReadParams as BaseReadParams,
  DBRecord,
  ReadResult,
  ResultWithKey,
} from '../model';
import { asyncRead } from '../operators/read';
import Store from '../store';
import { compareStringifiedObjects } from '../utils';

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
  const [transactionCount, setTransactionCount] = useState(-1);
  const [lastResult, setLastResult] = useState(
    createResultWithTransactionCount<T>(null, transactionCount),
  );

  useEffect(() => Store.subscribe(storeName, setTransactionCount), [storeName]);

  const persistedParams = useRef(params);
  const isParamChange = !areParamsEqueal(persistedParams.current, params);

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

  if (!Store.getDB()) return null;

  if (
    !isParamChange &&
    lastResult.value &&
    transactionCount === lastResult.transactionCount
  ) {
    return lastResult.value;
  }

  if (Store._isDevelopment) {
    lastResult.value = null;
  }

  asyncRead<T>(storeName, { ...params, onSuccess, onError });

  return lastResult.value;
}

export default useRead;

function createResultWithTransactionCount<T>(
  value: ReadResult<T> | null,
  transactionCount: number,
): ResultWithTransactionCount<T> {
  return { value, transactionCount };
}

function onError(event: Event): void {
  throw new Error(event.type);
}

// WIP
export function areParamsEqueal<T>(
  a: UseReadParams<T> | null | undefined,
  b: UseReadParams<T> | null | undefined,
): boolean {
  if (!a || !b) {
    return !a && !b;
  }
  const [keysA, keysB] = [Object.keys(a!), Object.keys(b!)];
  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (key !== keysB[i]) {
      return false;
    }
    const [valueA, valueB] = [a![key], b![key]];
    switch (key) {
      case 'keyRange':
        // IDBKeyrange acts weird
        if (a?.keyRange?.lower !== b?.keyRange?.lower) {
          return false;
        }
        if (a?.keyRange?.upper !== b?.keyRange?.upper) {
          return false;
        }
        if (a?.keyRange?.lowerOpen !== b?.keyRange?.lowerOpen) {
          return false;
        }
        if (a?.keyRange?.upperOpen !== b?.keyRange?.upperOpen) {
          return false;
        }
        if (a?.keyRange?.includes !== b?.keyRange?.includes) {
          return false;
        }
        break;
      default:
        if (valueA !== valueB) {
          return false;
        }
        break;
    }
  }

  return true;
}
