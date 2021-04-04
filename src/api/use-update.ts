import { asyncUpdate } from '../core/update';
import { DBRecord, UpdateData, Updater, UpdateResult } from '../model';
import Store from '../store';

function useUpdate<T extends DBRecord>(): Updater<T, void> {
  function update(
    storeName: string,
    data: UpdateData<T> | UpdateData<T>[],
    renderOnUpdate = true,
  ): void {
    const onError = (event: Event): void => {
      throw new Error((event.target as IDBRequest).error?.message || '');
    };

    const onComplete = (_: Event, keys: UpdateResult): void => {
      if (renderOnUpdate !== false) {
        Store.trigger(storeName, keys);
      }
    };

    asyncUpdate(storeName, { data, onComplete, onError });
  }
  return update;
}

export default useUpdate;
