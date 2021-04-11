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

const [errorMsg, nullMsg] = ['error', 'loading'];

const ReadComponent: React.FC<{
  storeName: string;
  params?: ReadParams;
  transform?: (result: ReadResult<DBRecord>) => any;
}> = ({ storeName, params, transform }) => {
  const [result, error] = useRead(storeName, params);
  transform ||= (result) => JSON.stringify(result);
  if (error) return <div>{errorMsg}</div>;
  if (!result) return <div>{nullMsg}</div>;
  return <div>{transform(result)}</div>;
};

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

function _render(component: React.ReactElement) {
  render(component, container);
}

async function renderAndWait(component: React.ReactElement, time = 10) {
  await act(async () => {
    _render(component);
    await sleep(time);
  });
}

function asssertContainerContent(value: string) {
  expect(container.textContent).toBe(value);
}

it('returns  null on mount', async (done) => {
  expect.assertions(1);
  const store = stores[0];
  await act(async () => {
    _render(<ReadComponent storeName={store.name} />);
    asssertContainerContent(nullMsg);
    await sleep(10);
  });
  done();
});

it('subscribes listener to store', async (done) => {
  expect.assertions(3);
  const store = stores[1];
  expect(Store['subscriptions'][store.name]).toBeUndefined();
  await renderAndWait(<ReadComponent storeName={store.name} />);
  expect(Store['subscriptions'][store.name]).toBeDefined();
  expect(Store['subscriptions'][store.name].listeners.length).toBe(1);
  done();
});

it('unsubscribes listener after unmount', async (done) => {
  expect.assertions(2);
  const store = stores[1];
  await renderAndWait(<ReadComponent storeName={store.name} />);
  expect(Store['subscriptions'][store.name].listeners.length).toBe(1);
  unmountComponentAtNode(container);
  await sleep(10);
  expect(Store['subscriptions'][store.name].listeners.length).toBe(0);
  done();
});

it('returns store data', async (done) => {
  expect.assertions(1);
  const store = stores[1];
  await renderAndWait(<ReadComponent storeName={store.name} />, 100);
  asssertContainerContent(JSON.stringify(store.data));
  done();
});

it('returns new store data on update', async (done) => {
  expect.assertions(1);
  const store = stores[0];
  const newValue = 'new';
  const newData = [...store.data, newValue];
  let updateKey;
  await renderAndWait(<ReadComponent storeName={store.name} />);
  await act(async () => {
    updateKey = await update(store.name, { value: newValue });
    await sleep(10);
  });
  asssertContainerContent(JSON.stringify(newData));
  unmountComponentAtNode(container);
  await sleep(10);
  await update(store.name, { value: null, key: updateKey });
  done();
});

it('returns new store data on param change', async (done) => {
  expect.assertions(2);
  const store = stores[0];
  await renderAndWait(<ReadComponent storeName={store.name} />, 500);
  asssertContainerContent(JSON.stringify(store.data));
  await renderAndWait(
    <ReadComponent storeName={store.name} params={{ direction: 'prev' }} />,
    500,
  );
  asssertContainerContent(JSON.stringify([...store.data].reverse()));
  done();
});

it('errors on unknown store', async (done) => {
  expect.assertions(1);
  await renderAndWait(<ReadComponent storeName={'unknown'} />);
  asssertContainerContent(errorMsg);
  done();
});

it('returns data in prev direction', async (done) => {
  const store = stores[1];
  expect.assertions(1);
  await renderAndWait(
    <ReadComponent storeName={store.name} params={{ direction: 'prev' }} />,
  );
  asssertContainerContent(JSON.stringify([...store.data].reverse()));
  done();
});

it('returns filtered data', async (done) => {
  const store = stores[0];
  expect.assertions(1);
  const filter = (i: unknown) => i !== store.data[0];
  await renderAndWait(<ReadComponent storeName={store.name} params={{ filter }} />);
  asssertContainerContent(JSON.stringify([...store.data].filter(filter)));
  done();
});

it('returns filtered data in prev direction', async (done) => {
  const store = stores[0];
  expect.assertions(1);
  const filter = (i: unknown) => i !== store.data[0];
  await renderAndWait(
    <ReadComponent storeName={store.name} params={{ filter, direction: 'prev' }} />,
  );
  asssertContainerContent(JSON.stringify([...store.data].filter(filter).reverse()));
  done();
});

it('returns one item by key', async (done) => {
  const store = stores[1];
  expect.assertions(1);
  await renderAndWait(
    <ReadComponent
      storeName={store.name}
      params={{ direction: 'prev', key: store.data[0][keyPath] }}
    />,
  );
  asssertContainerContent(JSON.stringify(store.data[0]));
  done();
});

it('returns one item by multiple keys', async (done) => {
  const store = stores[2];
  expect.assertions(1);
  await renderAndWait(
    <ReadComponent
      storeName={store.name}
      params={{
        direction: 'prev',
        key: [store.data[0][keyPath], store.data[0][keyPath2]],
      }}
    />,
  );
  asssertContainerContent(JSON.stringify(store.data[0]));
  done();
});

it('returns null on non-existent key', async (done) => {
  const store = stores[1];
  expect.assertions(1);
  await renderAndWait(
    <ReadComponent
      storeName={store.name}
      params={{
        direction: 'prev',
        key: 'unknown',
      }}
    />,
  );
  asssertContainerContent(nullMsg);
  done();
});

it('returns null on non-existent key combination', async (done) => {
  const store = stores[2];
  expect.assertions(1);
  await renderAndWait(
    <ReadComponent
      storeName={store.name}
      params={{
        direction: 'prev',
        key: [store.data[0][keyPath], store.data[1][keyPath2]],
      }}
    />,
  );
  asssertContainerContent(nullMsg);
  done();
});

it('returns key-bound items ', async (done) => {
  const store = stores[1];
  const [lower, upper] = [1, 3];
  expect.assertions(1);
  await renderAndWait(
    <ReadComponent
      storeName={store.name}
      params={{
        keyRange: IDBKeyRange.bound(lower, upper),
      }}
    />,
  );
  asssertContainerContent(
    JSON.stringify(
      (store.data as any[])
        .filter(({ key }) => key >= lower)
        .filter(({ key }) => key <= upper),
    ),
  );
  done();
});

it('returns lower key-bound items ', async (done) => {
  const store = stores[1];
  const [lower] = [1];
  expect.assertions(1);
  await renderAndWait(
    <ReadComponent
      storeName={store.name}
      params={{
        keyRange: IDBKeyRange.lowerBound(lower),
      }}
    />,
  );
  asssertContainerContent(
    JSON.stringify((store.data as any[]).filter(({ key }) => key >= lower)),
  );
  done();
});

it('returns upper key-bound items ', async (done) => {
  const store = stores[1];
  const [upper] = [1];
  expect.assertions(1);
  await renderAndWait(
    <ReadComponent
      storeName={store.name}
      params={{
        keyRange: IDBKeyRange.upperBound(upper),
      }}
    />,
  );
  asssertContainerContent(
    JSON.stringify((store.data as any[]).filter(({ key }) => key <= upper)),
  );
  done();
});
