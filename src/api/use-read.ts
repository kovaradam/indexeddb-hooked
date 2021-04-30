import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReadParams as BaseReadParams,
  DBRecord,
  ReadResult,
  ResultWithKey,
} from '../model';
import { asyncRead } from '../core/read';
import Store from '../store';
import { useSafeUpdater } from '../utils';

type UseReadReturnType<T> = [T, { error?: string; isLoading: boolean }];

interface UseReadParams<T> extends BaseReadParams<T> {}

type PersistedValues<T> = {
  params?: UseReadParams<T>;
  transactionCount: number;
  error?: string;
  isLoading: boolean;
  prevResult: ReadResult<T> | null;
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
  const forceUpdate = useSafeUpdater();
  const persisted = useRef<PersistedValues<T>>({
    params,
    transactionCount,
    error: undefined,
    isLoading: true,
    prevResult: null,
  });

  useEffect(() => {
    return Store.subscribe(storeName, setTransactionCount);
  }, [storeName]);

  const setErrorMessage = useCallback(
    (value?: string): void => {
      persisted.current.error = value;
    },
    [persisted],
  );

  const setIsLoading = useCallback(
    (isLoading: boolean): void => {
      persisted.current.isLoading = isLoading;
    },
    [persisted],
  );

  const setPrevResult = useCallback(
    (result: ReadResult<T>): void => {
      persisted.current.prevResult = result;
    },
    [persisted],
  );

  const onSuccess = useCallback(
    (result: ReadResult<T>, _: Event) => {
      setIsLoading(false);
      setPrevResult(result);
      forceUpdate();
    },
    [setPrevResult, setIsLoading, forceUpdate],
  );

  const onError = useCallback(
    (event: Event) => {
      setErrorMessage(String(event));
      setIsLoading(false);
      forceUpdate();
    },
    [setErrorMessage, setIsLoading, forceUpdate],
  );

  const read = useCallback(() => {
    setErrorMessage();
    setIsLoading(true);
    asyncRead<T>(storeName, {
      ...params,
      onSuccess,
      onError,
    });
  }, [params, onSuccess, storeName, setErrorMessage, onError, setIsLoading]);

  useEffect(() => {
    // read on mount
    if (Store.getDB()) {
      read();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createResult = useCallback(
    (value?: ReadResult<T>): UseReadReturnType<ReadResult<T>> => [
      value !== undefined ? value : persisted.current.prevResult,
      {
        error: persisted.current.error,
        isLoading: persisted.current.isLoading,
      },
    ],
    [persisted],
  );

  const isParamChange = !areParamsEqual(persisted.current.params, params);
  const isOutsideTrigger = transactionCount !== persisted.current.transactionCount;
  persisted.current.transactionCount = transactionCount;
  persisted.current.params = params;

  if (!Store.getDB()) return createResult(null);

  if (!isParamChange && !isOutsideTrigger) {
    return createResult();
  }

  read();

  return createResult();
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
