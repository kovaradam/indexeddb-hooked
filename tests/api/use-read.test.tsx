import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { Config, open, ReadParams, useRead } from '../../src';
import Store from '../../src/store';
import { sleep, stores } from '../utils';

const [errorMsg, nullMsg] = ['error', 'loading'];

const ReadComponent: React.FC<{ storeName: string; params?: ReadParams }> = ({
  storeName,
  params,
}) => {
  const [result, error] = useRead(storeName, params);
  if (error) return <div>{errorMsg}</div>;
  if (!result) return <div>{nullMsg}</div>;
  return <div>{JSON.stringify(result)}</div>;
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

it('returns store data', async (done) => {
  expect.assertions(1);
  const store = stores[0];
  await renderAndWait(<ReadComponent storeName={store.name} />);
  asssertContainerContent(JSON.stringify(store.data));
  done();
});

it('errors on unknown store', async (done) => {
  expect.assertions(1);
  await renderAndWait(<ReadComponent storeName={'unknown'} />);
  asssertContainerContent(errorMsg);
  done();
});
