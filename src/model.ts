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

export type UpdateData = {
  value: DBRecord | null;
  key?: IDBValidKey | IDBKeyRange;
  replace?: boolean;
};

export interface ReadParams<T = any> {
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
  dataKey?: string;
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
};

export type ResultWithKey<T> = { value: T; key: IDBValidKey };

export type ReadResult<T> = T | ResultWithKey<T> | T[] | ResultWithKey<T>[] | null;

export type Updater<T> = (
  storeName: string,
  data: UpdateData | UpdateData[],
  renderOnUpdate?: boolean,
) => T;
