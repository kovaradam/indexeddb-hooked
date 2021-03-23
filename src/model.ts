export type DBRecord = Record<string, unknown> | string | number;

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
  keepLastReadResults?: boolean;
  onOpenSuccess?: ((db: Event) => void) | (() => void);
  onOpenError?: ((event: Event) => void) | (() => void);
  onUpgradeNeeded?: ((event: IDBVersionChangeEvent) => void) | (() => void);
};
