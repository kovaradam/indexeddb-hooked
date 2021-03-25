import useDB from './use-db';
import { asyncUpdate } from '../operators/update';
import { UpdateData, Updater } from '../model';

function useUpdate(): Updater<void> {
  const { db, triggerUpdate } = useDB();

  function update(storeName: string, data: UpdateData, renderOnUpdate = true): void {
    const onError = (event: Event): void => {
      throw new Error(event.type);
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
