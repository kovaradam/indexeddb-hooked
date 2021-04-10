import { asyncUpdate } from '../core/update';
import { DBRecord, UpdateData, UpdateResult } from '../model';
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
): Promise<UpdateResult>;

function update(storeName: string, data: any, renderOnUpdate = true): Promise<unknown> {
  const [promise, resolve, reject] = createPromiseWithOutsideResolvers<
    UpdateResult,
    string
  >();
  function onComplete(_: Event, keys: UpdateResult): void {
    resolve(keys);
  }
  function onError(event: Event): void {
    reject(String(event));
  }
  asyncUpdate(storeName, { data, onComplete, onError, renderOnUpdate });
  return promise;
}

export default update;
