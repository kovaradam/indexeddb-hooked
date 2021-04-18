import { useCallback, useRef } from 'react';
import { asyncUpdate } from '../core/update';
import { DBRecord, UpdateData, Updater, UpdateResult } from '../model';
import { useStateUpdater } from '../utils';

type UseUpdateReturnType<T extends DBRecord> = [
  Updater<T, void>,
  { result: UpdateResult | UpdateResult[]; error?: string },
];

function useUpdate<T extends DBRecord>(): UseUpdateReturnType<T> {
  const error = useRef<string>();
  const result = useRef<UpdateResult | UpdateResult[]>();
  const forceUpdate = useStateUpdater();
  const setError = useCallback(
    (value: string | undefined) => {
      error.current = value;
    },
    [error],
  );

  const setResult = useCallback(
    (value: typeof result.current) => {
      result.current = value;
    },
    [result],
  );

  const update = useCallback(
    (
      storeName: string,
      data: UpdateData<T> | UpdateData<T>[],
      renderOnUpdate = true,
    ): void => {
      setError(undefined);
      const onError = (event: Event): void => {
        setError(String(event));
        forceUpdate();
      };

      const onComplete = (_: Event, keys: typeof result.current): void => {
        setResult(keys);
        forceUpdate();
      };

      asyncUpdate(storeName, {
        data,
        onComplete,
        onError,
        renderOnUpdate,
      });
    },
    [setError, setResult, forceUpdate],
  );

  return [update, { result: result.current, error: error.current }];
}

export default useUpdate;
