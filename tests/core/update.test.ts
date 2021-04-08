import { open, read } from '../../src';
import { asyncUpdate } from '../../src/core/update';
import { Config, ObjectStoreParams, UpdateResult } from '../../src/model';

const keyPath = 'key';

const stores: ObjectStoreParams[] = [
  {
    name: 'test',
    data: [1, 2, 3],
    options: { autoIncrement: true },
  },
  {
    name: 'testWithKey',
    data: [
      { [keyPath]: 1, val: 'test1' },
      { [keyPath]: 2, val: 'test2' },
      { [keyPath]: 3, val: 'test3' },
    ],
    options: { keyPath },
  },
];

beforeAll((done) => {
  const config: Config = {
    objectStores: stores,
  };
  open(config).then(() => done());
});

it('returns given key of given item', (done) => {
  expect.assertions(1);
  const store = stores[1];
  const item = (store.data as any)[0];
  const onComplete = (_: Event, key: UpdateResult) => {
    expect(key).toBe(item[keyPath]);
    done();
  };
  asyncUpdate(store.name, {
    data: { value: { ...item } },
    onComplete,
  });
});

it('updates item with inline key', (done) => {
  expect.assertions(1);
  const newValue = 'new';
  const store = stores[1];
  const item = (store.data as any)[0];
  const updateValue = { ...item, val: newValue };
  const onComplete = (_: Event, key: UpdateResult) => {
    read(store.name, { key }).then((result) => {
      expect(result).toStrictEqual(updateValue);
      done();
    });
  };
  asyncUpdate(store.name, {
    data: { value: updateValue },
    onComplete,
  });
});

it('updates item with out-of-line key', (done) => {
  expect.assertions(1);
  const store = stores[0];
  const item = (store.data as any)[0];
  const updateValue = 5;
  const onComplete = (_: Event, key: UpdateResult) => {
    read(store.name, { key }).then((result) => {
      expect(result).toStrictEqual(updateValue);
      done();
    });
  };
  asyncUpdate(store.name, {
    data: { value: updateValue, key: item },
    onComplete,
  });
});

it('deletes item', (done) => {
  expect.assertions(1);
  const store = stores[1];
  const item = (store.data as any)[0];
  const onComplete = (_: Event, key: UpdateResult) => {
    read(store.name, { key: item.key }).then((result) => {
      expect(result).toStrictEqual(null);
      done();
    });
  };
  asyncUpdate(store.name, {
    data: { value: null, key: item.key },
    onComplete,
  });
});

it('return undefined key on delete item', (done) => {
  expect.assertions(1);
  const store = stores[1];
  const item = (store.data as any)[1];
  const onComplete = (_: Event, key: UpdateResult) => {
    expect(key).toStrictEqual(undefined);
    done();
  };
  asyncUpdate(store.name, {
    data: { value: null, key: item.key },
    onComplete,
  });
});
