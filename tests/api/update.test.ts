import { open, read, update } from '../../src';
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

it('returns key of updated item', (done) => {
  expect.assertions(1);
  const newValue = 'new';
  const key = 1;
  const store = stores[0];
  update(store.name, { value: newValue, key }).then((result) => {
    expect(result).toBe(key);
    done();
  });
});

it('updates primitive data item', (done) => {
  expect.assertions(1);
  const newValue = 'new';
  const key = 1;
  const store = stores[0];
  update(store.name, { value: newValue, key }).then((result) => {
    read(store.name, { key: result }).then((result) => {
      expect(result).toBe(newValue);
      done();
    });
  });
});

it('throw error on delete with no key', (done) => {
  expect.assertions(1);
  const store = stores[0];
  update(store.name, { value: null }).catch((result) => {
    expect(result).toBeTruthy();
    done();
  });
});

it('throw error on update with non-existent storeName', (done) => {
  expect.assertions(1);
  update('unknown', []).catch((result) => {
    expect(result).toBeTruthy();
    done();
  });
});

it('updates item with inline key', (done) => {
  expect.assertions(1);
  const newValue = 'new';
  const store = stores[1];
  const item = (store.data as any)[0];
  const updateValue = { ...item, val: newValue };
  update(store.name, { value: updateValue }).then((key: UpdateResult) => {
    read(store.name, { key }).then((result) => {
      expect(result).toStrictEqual(updateValue);
      done();
    });
  });
});
