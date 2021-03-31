import { asyncUpdate } from '../operators/update';
import { UpdateData, Updater, UpdateResult } from '../model';
import Store from '../store';

function useUpdate(): Updater<void> {
  function update(
    storeName: string,
    data: UpdateData | UpdateData[],
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
