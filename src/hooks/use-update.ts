import { asyncUpdate } from '../operators/update';
import { UpdateData, Updater } from '../model';
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

    const onComplete = (_: Event): void => {
      if (renderOnUpdate) {
        Store.trigger(storeName);
      }
    };

    asyncUpdate(storeName, { data, onComplete, onError });
  }
  return update;
}

export default useUpdate;
