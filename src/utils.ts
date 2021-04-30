import React, { useEffect, useReducer, useRef } from 'react';

type OutsideResolve<T> = (value: T) => void;
type OutsideReject<T = string> = (reason: T) => void;

export function createPromiseWithOutsideResolvers<Value, Reason>(): [
  Promise<Value>,
  OutsideResolve<Value>,
  OutsideReject<Reason>,
] {
  let outsideResolve = (_: Value) => {};
  let outsideReject = (_: Reason) => {};

  const promise = new Promise<Value>(
    (resolve: typeof outsideResolve, reject: typeof outsideReject) => {
      outsideResolve = resolve;
      outsideReject = reject;
    },
  );

  return [promise, outsideResolve, outsideReject];
}

export function useSafeUpdater(): React.DispatchWithoutAction {
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
