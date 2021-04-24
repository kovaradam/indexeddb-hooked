import { useEffect, useReducer, useRef } from 'react';

type OutsideResolve<T> = (value: T) => void;
type OutsideReject<T = string> = (reason: T) => void;

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

export function useStateUpdater() {
  const isMounted = useRef(true);

  const [, forceUpdate] = useReducer((p) => (isMounted.current ? !p : p), false);

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    [isMounted],
  );
  return forceUpdate;
}
