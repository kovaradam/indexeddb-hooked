import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Config, open, useUpdate } from '../../src';
import Store from '../../src/store';
import { keyPath, sleep, stores } from '../utils';

async function renderHook(time = 10): Promise<{ current: ReturnType<typeof useUpdate> }> {
  let result = { current: null };

  function TestComponent() {
    result.current = useUpdate();
    return null;
  }

  await act(async () => {
    render(<TestComponent />, container);
    await sleep(time);
  });

  return result;
}

function createResult(
  result: IDBValidKey,
  error?: string,
): { error?: string; result: IDBValidKey } {
  return { result, error };
}

beforeAll((done) => {
  const config: Config = {
    objectStores: stores,
  };
  open(config).then(() => done());
});

let container = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it('returns updater, undefined error and result on mount', async (done) => {
  expect.assertions(2);
  await act(async () => {
    const result = await renderHook(0);
    expect(typeof result.current[0]).toStrictEqual('function');
    expect(result.current[1]).toStrictEqual(createResult(undefined));
    await sleep(10);
  });
  done();
});

it('returns result key after update', async (done) => {
  expect.assertions(1);
  const store = stores[1];
  const updateKey = store.data[0][keyPath];
  await act(async () => {
    const result = await renderHook(10);
    const [update] = result.current;
    update(store.name, { value: 'new', key: updateKey });
    await sleep(10);
    expect(result.current[1]).toStrictEqual(createResult(updateKey));
  });
  done();
});

it('returns undefined result after deletion', async (done) => {
  expect.assertions(1);
  const store = stores[1];
  const updateKey = store.data[0][keyPath];
  await act(async () => {
    const result = await renderHook(10);
    const [update] = result.current;
    update(store.name, { value: null, key: updateKey });
    await sleep(10);
    expect(result.current[1]).toStrictEqual(createResult(undefined));
  });
  done();
});

it('sets error on invalid operation', async (done) => {
  expect.assertions(1);
  const store = stores[1];
  await act(async () => {
    const result = await renderHook(10);
    const [update] = result.current;
    update(store.name, { value: null });
    await sleep(10);
    expect(result.current[1].error).toBeTruthy();
  });
  done();
});

it('sets undefined error on valid operation after invalid one', async (done) => {
  expect.assertions(2);
  const store = stores[0];
  await act(async () => {
    const result = await renderHook(10);
    const [update] = result.current;
    update(store.name, { value: null });
    await sleep(10);
    expect(result.current[1].error).toBeTruthy();
    update(store.name, { value: null, key: 0 });
    await sleep(10);
    expect(result.current[1].error).toBe(undefined);
    await sleep(10);
  });
  done();
});

it('triggers store notify on update', async (done) => {
  expect.assertions(1);
  const store = stores[0];
  Store.notify = jest.fn();
  await act(async () => {
    const result = await renderHook(10);
    const [update] = result.current;
    update(store.name, { value: 'new' });
    await sleep(10);
  });
  expect(Store.notify).toBeCalled();
  done();
});
