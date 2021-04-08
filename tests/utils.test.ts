import {
  compareStringifiedObjects,
  createPromiseWithOutsideResolvers,
} from '../src/utils';

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

it('returns true on comparison of some falsy values', () => {
  const values: [any, any][] = [
    [undefined, undefined],
    [undefined, null],
    [null, null],
    ['', ''],
    [0, 0],
    [[], []],
  ];
  values.forEach(([a, b]) => expect(compareStringifiedObjects(a, b)).toBe(true));
});

it('returns false on comparison of some falsy values', () => {
  const values: [any, any][] = [
    [undefined, []],
    [[], ''],
    ['', 0],
    [0, null],
  ];
  values.forEach(([a, b]) => expect(compareStringifiedObjects(a, b)).toBe(false));
});

it('returns true on same objects', () => {
  const a = { test: 'test' };
  const values: [any, any][] = [
    [a, a],
    [{ ...a }, a],
    [{ ...a }, { ...a }],
  ];
  values.forEach(([a, b]) => expect(compareStringifiedObjects(a, b)).toBe(true));
});

it('returns false on different objects', () => {
  const a = { test: 'a' };
  const b = { test: 'b' };
  const c = { val: 'c' };
  const values: [any, any][] = [
    [a, b],
    [b, c],
    [c, a],
  ];
  values.forEach(([a, b]) => expect(compareStringifiedObjects(a, b)).toBe(false));
});
