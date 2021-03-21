export type DBRecord = Record<string, unknown> | string | number;

export type UpdateData = {
  value: DBRecord | null;
  key?: IDBValidKey | IDBKeyRange;
  replace?: boolean;
};

export interface BaseReadParams {
  key?: IDBValidKey;
  keyRange?: IDBKeyRange;
  direction?: IDBCursorDirection;
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
