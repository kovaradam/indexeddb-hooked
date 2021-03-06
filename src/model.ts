export type DBRecord =
  | Record<string, unknown>
  | string
  | number
  | boolean
  | Date
  | RegExp
  | undefined
  | Blob
  | File
  | Record<string, unknown>[]
  | string[]
  | number[]
  | boolean[]
  | Date[]
  | RegExp[]
  | undefined[];

export type UpdateData<T> = {
  value: T | null;
  key?: IDBValidKey | IDBKeyRange;
  replace?: boolean;
};

export interface ReadParams<T = any> extends Record<string, unknown> {
  key?: IDBValidKey;
  keyRange?: IDBKeyRange;
  direction?: IDBCursorDirection;
  index?: string;
  filter?: (value: T) => boolean;
  returnWithKey?: boolean;
}

interface IndexParams {
  name: string;
  keyPath: string | string[];
  options?: IDBIndexParameters;
}

export interface ObjectStoreParams {
  name: string;
  options?: IDBObjectStoreParameters;
  indexes?: IndexParams[];
  data?: DBRecord[];
}

export type Config = {
  name?: string;
  version?: number;
  objectStores: ObjectStoreParams[];
  onOpenSuccess?: ((db: Event) => void) | (() => void);
  onOpenError?: ((event: Event) => void) | (() => void);
  onUpgradeNeeded?:
    | ((event: IDBVersionChangeEvent, objectStores: ObjectStoreParams[]) => void)
    | (() => void);
  _isDevelopment?: boolean;
};

export type ResultWithKey<T> = { value: T; key: IDBValidKey };

export type ReadResult<T> = T | ResultWithKey<T> | T[] | ResultWithKey<T>[] | null;

export type UpdateResult = IDBValidKey | undefined;

export type Updater<T extends DBRecord, U> = (
  storeName: string,
  data: UpdateData<T> | UpdateData<T>[],
  renderOnUpdate?: boolean,
) => U;
