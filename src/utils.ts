type OutsideResolve<T> = (value: T) => void;
type OutsideReject<T> = (reason: T) => void;

export function createPromiseWithOutsideResolvers<Value, Reason>(): [
  Promise<Value>,
  OutsideResolve<Value>,
  OutsideReject<Reason>,
] {
  let outsideResolve = (_: Value) => {
    return;
  };
  let outsideReject = (_: Reason) => {
    return;
  };
  const promise = new Promise<Value>(function (
    resolve: typeof outsideResolve,
    reject: typeof outsideReject,
  ) {
    outsideResolve = resolve;
    outsideReject = reject;
  });
  return [promise, outsideResolve, outsideReject];
}

type ComparableObjectType =
  | Record<string, unknown>
  | Record<string, unknown>[]
  | null
  | undefined;

export function compareStringifiedObjects(
  a: ComparableObjectType,
  b: ComparableObjectType,
): boolean {
  if (!a && !b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

export function usesInlineKeys(objectStore: IDBObjectStore): boolean {
  return (
    (objectStore.keyPath !== undefined && objectStore.keyPath !== null) ||
    objectStore.autoIncrement
  );
}
