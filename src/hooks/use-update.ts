import useDB from './use-db';
import { asyncUpdate } from '../operators/update';
import { UpdateData } from '../model';

type UseUpdateReturnType = (storeName: string, data: UpdateData) => void;

function useUpdate(): UseUpdateReturnType {
  const { db, triggerUpdate } = useDB();

  function update(storeName: string, data: UpdateData): void {
    const onError = (event: Event): void => {
      console.log(event.type);
    };

    const onComplete = (_: Event): void => {
      triggerUpdate(storeName);
    };

    asyncUpdate(storeName, { data, db, onComplete, onError });
  }
  return update;
}

export default useUpdate;
