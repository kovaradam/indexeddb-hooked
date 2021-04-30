import React from 'react';
import { createPromiseWithOutsideResolvers, useSafeUpdater } from '../src/utils';
import { sleep } from './utils';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

async function renderHook(
  renderCount: number,
  time = 10,
): Promise<{ updater: React.DispatchWithoutAction; renderCount: number }> {
  let result = { updater: null, renderCount };

  function TestComponent() {
    result.updater = useSafeUpdater();
    return <TestChildComponent />;
  }

  function TestChildComponent() {
    result.renderCount++;
    return null;
  }

  await act(async () => {
    render(<TestComponent />, container);
    await sleep(time);
  });

  return result;
}

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

test('updater call forces state change', async (done) => {
  expect.assertions(2);
  const initRenderCount = 0;
  const result = await renderHook(initRenderCount);
  expect(result.renderCount).toBe(initRenderCount + 1);
  act(() => result.updater());
  expect(result.renderCount).toBe(initRenderCount + 2);
  done();
});

test('updater call does not force state after unmount', async (done) => {
  expect.assertions(1);
  const initRenderCount = 0;
  const result = await renderHook(initRenderCount);
  await act(async () => {
    render(null, container);
  });
  act(() => result.updater());
  expect(result.renderCount).toBe(initRenderCount + 1);
  done();
});

it('creates promise with outside resolvers', () => {
  const [promise, resolve, reject] = createPromiseWithOutsideResolvers();
  expect(promise.then).toBeDefined();
  expect(typeof resolve).toBe('function');
  expect(typeof reject).toBe('function');
});

it('resolves a promise with correct value', (done) => {
  expect.assertions(1);
  const value = 1;
  const [promise, resolve] = createPromiseWithOutsideResolvers<typeof value, unknown>();
  resolve(value);
  promise.then((result) => {
    expect(result).toBe(value);
    done();
  });
});

it('rejects a promise with correct value', (done) => {
  expect.assertions(1);
  const value = 1;
  const [promise, , reject] = createPromiseWithOutsideResolvers<unknown, typeof value>();
  reject(value);
  promise.catch((result) => {
    expect(result).toBe(value);
    done();
  });
});
