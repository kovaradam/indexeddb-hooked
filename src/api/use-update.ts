import { useCallback, useState } from 'react';
import { asyncUpdate } from '../core/update';
import { DBRecord, UpdateData, Updater, UpdateResult } from '../model';

type UseUpdateReturnType<T extends DBRecord> = [
  Updater<T, void>,
  { result: UpdateResult | UpdateResult[]; error?: string },
];

function useUpdate<T extends DBRecord>(): UseUpdateReturnType<T> {
  const [result, setResult] = useState<UpdateResult | UpdateResult[]>();
  const [error, setError] = useState<string>();

  const update = useCallback(
    (
      storeName: string,
      data: UpdateData<T> | UpdateData<T>[],
      renderOnUpdate = true,
    ): void => {
      const onError = (event: Event): void => {
        setError(String(event));
      };

      const onComplete = (_: Event, keys: UpdateResult | UpdateResult[]): void =>
        setResult(keys);

      asyncUpdate(storeName, {
        data,
        onComplete,
        onError,
        renderOnUpdate,
      });
    },
    [setError, setResult],
  );

  return [update, { result, error }];
}

export default useUpdate;
