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

type ErrorObject = { message?: string };

type ResultWithTransactionCount<T> = {
  value: ReadResult<T> | null;
  transactionCount: number;
};

type UseReadReturnType<T> = [T, string?];

interface UseReadParams<T> extends BaseReadParams<T> {}

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
  const [lastResult, setLastResult] = useState(
    createResultWithTransactionCount<T>(null, transactionCount),
  );

  const error = useRef<ErrorObject>({});

  useEffect(() => Store.subscribe(storeName, setTransactionCount), [storeName]);

  const persistedParams = useRef(params);
  const isParamChange = !areParamsEqual(persistedParams.current, params);
  const isOutsideTrigger = transactionCount !== lastResult.transactionCount;

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

  const setErrorMessage = useCallback(
    (value?: string): void => {
      error.current.message = value;
    },
    [error],
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

  const createResult = useCallback(
    (value: ReadResult<T>): UseReadReturnType<ReadResult<T>> => [
      value,
      error.current.message,
    ],
    [error],
  );

  if (!isParamChange && !isOutsideTrigger) {
    return createResult(lastResult.value);
  }

  if (!Store.getDB()) return createResult(null);

  if (Store._isDevelopment) {
    lastResult.value = null;
  }

  read();

  return createResult(lastResult.value);
}

export default useRead;

function createResultWithTransactionCount<T>(
  value: ReadResult<T> | null,
  transactionCount: number,
): ResultWithTransactionCount<T> {
  return { value, transactionCount };
}

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
