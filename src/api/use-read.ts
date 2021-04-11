import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReadParams as BaseReadParams,
  DBRecord,
  ReadResult,
  ResultWithKey,
} from '../model';
import { asyncRead } from '../core/read';
import Store from '../store';
import { compareStringifiedObjects } from '../utils';

type UseReadReturnType<T> = [T, string?];

interface UseReadParams<T> extends BaseReadParams<T> {}

type PersistedValues<T> = {
  params?: UseReadParams<T>;
  transactionCount: number;
  error?: string;
};

function useRead<T extends DBRecord>(
  storeName: string,
  params: UseReadParams<T> & { key: IDBValidKey; returnWithKey: true },
): UseReadReturnType<ResultWithKey<T> | null>;

function useRead<T extends DBRecord>(
  storeName: string,
  params: UseReadParams<T> & { key: IDBValidKey },
): UseReadReturnType<T | null>;

function useRead<T extends DBRecord>(
  storeName: string,
  params: UseReadParams<T> & { returnWithKey: true },
): UseReadReturnType<ResultWithKey<T>[] | null>;

function useRead<T extends DBRecord>(
  storeName: string,
  params?: UseReadParams<T>,
): UseReadReturnType<T[] | null>;

function useRead<T extends DBRecord>(
  storeName: string,
  params?: UseReadParams<T>,
): UseReadReturnType<ReadResult<T> | null> {
  const [transactionCount, setTransactionCount] = useState(-1);
  const [, setError] = useState<string>();
  const [lastResult, setLastResult] = useState<ReadResult<T> | null>(null);
  const persistedValues = useRef<PersistedValues<T>>({
    params,
    transactionCount,
    error: undefined,
  });

  useEffect(() => Store.subscribe(storeName, setTransactionCount), [storeName]);

  const onSuccess = useCallback(
    (result: ReadResult<T>, _: Event) => {
      const compare =
        typeof result === 'object'
          ? compareStringifiedObjects
          : (a: unknown, b: unknown): boolean => a === b;
      if (
        !compare(result as Record<string, unknown>, lastResult as Record<string, unknown>)
      ) {
        setLastResult(result);
      }
    },
    [lastResult],
  );

  const setErrorMessage = useCallback(
    (value?: string): void => {
      persistedValues.current.error = value;
      setError(value);
    },
    [persistedValues],
  );

  const read = useCallback(() => {
    setErrorMessage();
    asyncRead<T>(storeName, {
      ...params,
      onSuccess,
      onError: (event: Event) => setErrorMessage(String(event)),
    });
  }, [params, onSuccess, storeName, setErrorMessage]);

  useEffect(() => {
    // read on mount
    if (Store.getDB()) {
      read();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isParamChange = !areParamsEqual(persistedValues.current.params, params);
  const isOutsideTrigger = transactionCount !== persistedValues.current.transactionCount;
  persistedValues.current.transactionCount = transactionCount;
  persistedValues.current.params = params;

  const createResult = useCallback(
    (value: ReadResult<T>): UseReadReturnType<ReadResult<T>> => [
      value,
      persistedValues.current.error,
    ],
    [persistedValues],
  );

  if (!isParamChange && !isOutsideTrigger) {
    return createResult(lastResult);
  }

  if (!Store.getDB()) return createResult(null);

  read();

  if (Store._isDevelopment) {
    return createResult(null);
  }
  return createResult(lastResult);
}

export default useRead;

// WIP
export function areParamsEqual<T>(
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
