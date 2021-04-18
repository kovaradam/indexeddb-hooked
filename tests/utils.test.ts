import { createPromiseWithOutsideResolvers } from '../src/utils';

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
