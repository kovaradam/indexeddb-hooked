import { asyncUpdate } from '../core/update';
import { DBRecord, UpdateData, UpdateResult } from '../model';
import Store from '../store';
import { createPromiseWithOutsideResolvers } from '../utils';

function update<T extends DBRecord>(
  storeName: string,
  data: UpdateData<T>[],
  renderOnUpdate?: boolean,
): Promise<UpdateResult[]>;

function update<T extends DBRecord>(
  storeName: string,
  data: UpdateData<T>,
  renderOnUpdate?: boolean,
): Promise<IDBValidKey>;

function update(storeName: string, data: any, renderOnUpdate = true): Promise<unknown> {
  const [promise, resolve, reject] = createPromiseWithOutsideResolvers<
    UpdateResult,
    string
  >();
  function onComplete(_: Event, keys: UpdateResult): void {
    if (renderOnUpdate !== false) {
      Store.trigger(storeName, keys);
    }
    resolve(keys);
  }
  function onError(event: Event): void {
    reject((event.target as IDBRequest).error?.message || '');
  }
  asyncUpdate(storeName, { data, onComplete, onError });
  return promise;
}

export default update;
