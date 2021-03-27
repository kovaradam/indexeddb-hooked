import useDB from './use-db';
import { asyncUpdate } from '../operators/update';
import { UpdateData, Updater } from '../model';

function useUpdate(): Updater<void> {
  const { db, triggerUpdate } = useDB();

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
        triggerUpdate(storeName);
      }
    };

    asyncUpdate(storeName, { data, db, onComplete, onError });
  }
  return update;
}

export default useUpdate;
