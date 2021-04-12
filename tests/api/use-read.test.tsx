import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import {
  Config,
  DBRecord,
  open,
  ReadParams,
  ReadResult,
  update,
  useRead,
} from '../../src';
import Store from '../../src/store';
import { keyPath, keyPath2, sleep, stores } from '../utils';

async function renderHook(storeName: string, params?: ReadParams, time = 10) {
  let result = { current: null };

  function TestComponent() {
    result.current = useRead(storeName, params);
    return null;
  }

  await act(async () => {
    render(<TestComponent />, container);
    await sleep(time);
  });

  return result;
}

function createResult(
  result: ReadResult<DBRecord>,
  error?: string,
): [ReadResult<DBRecord>, string?] {
  return [result, error];
}

beforeAll((done) => {
  const config: Config = {
    objectStores: stores,
  };
  open(config).then(() => done());
});

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('returns  null on mount', async (done) => {
  expect.assertions(1);
  const store = stores[0];
  await act(async () => {
    const result = await renderHook(store.name, undefined, 0);
    expect(result.current).toStrictEqual(createResult(null));
    await sleep(10);
  });
  done();
});

it('subscribes listener to store', async (done) => {
  expect.assertions(3);
  const store = stores[1];
  expect(Store['subscriptions'][store.name]).toBeUndefined();
  await renderHook(store.name);
  expect(Store['subscriptions'][store.name]).toBeDefined();
  expect(Store['subscriptions'][store.name].listeners.length).toBe(1);
  done();
});

it('unsubscribes listener after unmount', async (done) => {
  expect.assertions(2);
  const store = stores[1];
  await renderHook(store.name);
  expect(Store['subscriptions'][store.name].listeners.length).toBe(1);
  unmountComponentAtNode(container);
  await sleep(10);
  expect(Store['subscriptions'][store.name].listeners.length).toBe(0);
  done();
});

it('returns store data', async (done) => {
  expect.assertions(1);
  const store = stores[1];
  const result = await renderHook(store.name);
  expect(result.current).toStrictEqual(createResult(store.data));
  done();
});

it('returns new store data on update', async (done) => {
  expect.assertions(1);
  const store = stores[0];
  const newValue = 'new';
  const newData = [...store.data, newValue];
  let updateKey;
  const result = await renderHook(store.name);
  await act(async () => {
    updateKey = await update(store.name, { value: newValue });
    await sleep(10);
  });
  expect(result.current).toStrictEqual(createResult(newData));
  unmountComponentAtNode(container);
  await sleep(10);
  await update(store.name, { value: null, key: updateKey });
  done();
});

it('returns new store data on param change', async (done) => {
  expect.assertions(2);
  const store = stores[0];
  let result = await renderHook(store.name);
  expect(result.current).toStrictEqual(createResult(store.data));
  result = await renderHook(store.name, { direction: 'prev' });
  expect(result.current).toStrictEqual(createResult([...store.data].reverse()));
  done();
});

it('errors on unknown store', async (done) => {
  expect.assertions(1);
  const result = await renderHook('unknown');
  expect(result.current[1]).toBeTruthy();
  done();
});

it('returns data in prev direction', async (done) => {
  const store = stores[1];
  expect.assertions(1);
  const result = await renderHook(store.name, { direction: 'prev' });
  expect(result.current).toStrictEqual(createResult([...store.data].reverse()));
  done();
});

it('returns filtered data', async (done) => {
  const store = stores[0];
  expect.assertions(1);
  const filter = (i: unknown) => i !== store.data[0];
  const result = await renderHook(store.name, { filter });
  expect(result.current).toStrictEqual(createResult([...store.data].filter(filter)));
  done();
});

it('returns filtered data in prev direction', async (done) => {
  const store = stores[0];
  expect.assertions(1);
  const filter = (i: unknown) => i !== store.data[0];
  const result = await renderHook(store.name, { filter, direction: 'prev' });
  expect(result.current).toStrictEqual(
    createResult([...store.data].filter(filter).reverse()),
  );
  done();
});

it('returns one item by key', async (done) => {
  const store = stores[1];
  expect.assertions(1);
  const result = await renderHook(store.name, {
    direction: 'prev',
    key: store.data[0][keyPath],
  });
  expect(result.current).toStrictEqual(createResult(store.data[0]));
  done();
});

it('returns one item by multiple keys', async (done) => {
  const store = stores[2];
  expect.assertions(1);
  const result = await renderHook(store.name, {
    direction: 'prev',
    key: [store.data[0][keyPath], store.data[0][keyPath2]],
  });
  expect(result.current).toStrictEqual(createResult(store.data[0]));
  done();
});

it('returns null on non-existent key', async (done) => {
  const store = stores[1];
  expect.assertions(1);
  const result = await renderHook(store.name, {
    direction: 'prev',
    key: 'unknown',
  });
  expect(result.current).toStrictEqual(createResult(null));
  done();
});

it('returns null on non-existent key combination', async (done) => {
  const store = stores[2];
  expect.assertions(1);
  const result = await renderHook(store.name, {
    direction: 'prev',
    key: [store.data[0][keyPath], store.data[1][keyPath2]],
  });
  expect(result.current).toStrictEqual(createResult(null));
  done();
});

it('returns key-bound items ', async (done) => {
  const store = stores[1];
  const [lower, upper] = [1, 3];
  expect.assertions(1);
  const result = await renderHook(store.name, {
    keyRange: IDBKeyRange.bound(lower, upper),
  });
  expect(result.current).toStrictEqual(
    createResult(
      (store.data as any[])
        .filter(({ key }) => key >= lower)
        .filter(({ key }) => key <= upper),
    ),
  );
  done();
});

it('returns upper-key-bound items ', async (done) => {
  const store = stores[1];
  const [, upper] = [1, 3];
  expect.assertions(1);
  const result = await renderHook(store.name, {
    keyRange: IDBKeyRange.upperBound(upper),
  });
  expect(result.current).toStrictEqual(
    createResult((store.data as any[]).filter(({ key }) => key <= upper)),
  );
  done();
});

it('returns lower-key-bound items ', async (done) => {
  const store = stores[1];
  const [lower] = [1, 3];
  expect.assertions(1);
  const result = await renderHook(store.name, {
    keyRange: IDBKeyRange.lowerBound(lower),
  });
  expect(result.current).toStrictEqual(
    createResult((store.data as any[]).filter(({ key }) => key >= lower)),
  );
  done();
});
