import { asyncRead } from '../core/read';
import {
  DBRecord,
  ReadParams as BaseReadParams,
  ReadResult,
  ResultWithKey,
} from '../model';
import { createPromiseWithOutsideResolvers } from '../utils';

interface ReadParams<T> extends BaseReadParams<T> {}

function read<T extends DBRecord>(
  storeName: string,
  params: ReadParams<T> & { key: IDBValidKey; returnWithKey: true },
): Promise<ResultWithKey<T> | null>;

function read<T extends DBRecord>(
  storeName: string,
  params: ReadParams<T> & { key: IDBValidKey },
): Promise<T | null>;

function read<T extends DBRecord>(
  storeName: string,
  params: ReadParams<T> & { returnWithKey: true },
): Promise<ResultWithKey<T>[] | null>;

function read<T extends DBRecord>(
  storeName: string,
  params?: ReadParams<T>,
): Promise<T[] | null>;

function read<T>(storeName: string, params?: ReadParams<T>): Promise<ReadResult<T>> {
  const [promise, resolve, reject] = createPromiseWithOutsideResolvers<
    ReadResult<T>,
    string
  >();

  function onSuccess(result: ReadResult<T>, _: Event): void {
    resolve(result);
  }

  function onError(event: Event): void {
    reject(String(event));
  }

  asyncRead(storeName, { ...params, onSuccess, onError });
  return promise;
}

export default read;
