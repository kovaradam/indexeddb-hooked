import { read, open } from '../../src';
import { Config, ObjectStoreParams } from '../../src/model';
import Store, { close } from '../../src/store';

let counter = 0;

function getConfig(config: Config): Config {
  const ret = { ...config, name: `db${++counter}` };
  return ret;
}

const baseStore = { name: 'testStore' };

function getStore(store: Omit<ObjectStoreParams, 'name'>): ObjectStoreParams {
  return { ...baseStore, ...store };
}

beforeEach(() => {
  if (Store.getDB()) {
    close();
  }
});

it('opens db', (done) => {
  expect.assertions(1);
  const config = getConfig({
    objectStores: [baseStore],
  });
  open(config).then((result) => {
    expect(result.objectStoreNames).toContain(config.objectStores[0].name);
    done();
  });
});

it('sets db name', (done) => {
  expect.assertions(1);
  const config = getConfig({
    name: 'new',
    objectStores: [baseStore],
  });
  open(config).then((result) => {
    expect(result.name).toBe(config.name);
    done();
  });
});

it('sets db version', (done) => {
  expect.assertions(1);
  const config = getConfig({
    version: 2,
    objectStores: [baseStore],
  });
  open(config).then((result) => {
    expect(result.version).toBe(config.version);
    done();
  });
});

it('sets Store db on success', (done) => {
  expect.assertions(1);
  const config = getConfig({
    objectStores: [baseStore],
  });
  open(config).then(() => {
    expect(Store.getDB()).toBeTruthy();
    done();
  });
});

it('calls Store.wake db on success', (done) => {
  expect.assertions(1);
  Store.wake = jest.fn();
  const config = getConfig({
    objectStores: [baseStore],
  });
  open(config).then(() => {
    expect(Store.wake).toBeCalled();
    done();
  });
});

it('calls onOpenSuccess on open success', (done) => {
  expect.assertions(1);
  const onOpenSuccess = jest.fn();
  const config = getConfig({
    objectStores: [baseStore],
    onOpenSuccess,
  });
  open(config).then(() => {
    expect(onOpenSuccess).toBeCalled();
    done();
  });
});

it('populates store with primitive data and autoIncrement', (done) => {
  expect.assertions(1);
  const store = getStore({
    data: [1, 2, 3],
    options: { autoIncrement: true },
  });
  const config = getConfig({
    objectStores: [store],
  });
  open(config).then((result) => {
    expect(result.objectStoreNames).toContain(store.name);
    result.close();
    done();
  });
});

it('populates store with primitive data and autoIncrement - onOpenSuccess', (done) => {
  if (Store.getDB()) {
    close();
  }
  expect.assertions(1);
  const store = getStore({
    data: [1, 2, 3],
    options: { autoIncrement: true },
  });
  const config = getConfig({
    version: 5,
    objectStores: [store],
    onOpenSuccess: () =>
      read(store.name).then((result) => {
        expect(result.length).toBe(store.data.length);
        done();
      }),
  });
  open(config);
});

it('populates store with data and keyPath specified', (done) => {
  expect.assertions(1);
  const keyPath = 'key';
  const store = getStore({
    data: [{ [keyPath]: 1 }, { [keyPath]: 2 }],
    options: { keyPath },
  });
  const config = getConfig({
    objectStores: [store],
  });

  open(config).then(() =>
    read(store.name).then((result) => {
      expect(result.length).toBe(store.data.length);
      done();
    }),
  );
});

it('calls onUpgradeNeeded callback on new db if specified', (done) => {
  expect.assertions(1);
  const onUpgradeNeeded = jest.fn();
  const config = getConfig({
    objectStores: [baseStore],
    onUpgradeNeeded,
  });

  open(config).then(() => {
    expect(onUpgradeNeeded).toBeCalled();
    done();
  });
});

it('creates index', (done) => {
  expect.assertions(1);
  const indexName = 'test';
  const store = getStore({ indexes: [{ name: indexName, keyPath: 'key' }] });
  const config = getConfig({
    objectStores: [store],
  });

  open(config).then((result) => {
    const storeName = config.objectStores[0].name;
    expect(result.transaction(storeName).objectStore(storeName).indexNames).toContain(
      indexName,
    );
    done();
  });
});

it('creates indices with given params', (done) => {
  const indexNames = ['a', 'b'];
  const indexKeyPath = 'test';
  expect.assertions(3 * indexNames.length);
  const indexOptions: IDBIndexParameters = {
    multiEntry: true,
    unique: true,
  };
  const store = getStore({
    indexes: [
      { name: indexNames[0], keyPath: indexKeyPath, options: indexOptions },
      { name: indexNames[1], keyPath: indexKeyPath },
    ],
  });
  const config = getConfig({
    objectStores: [store],
  });

  open(config).then((result) => {
    const storeName = config.objectStores[0].name;
    let index = result.transaction(storeName).objectStore(storeName).index(indexNames[0]);
    expect(index.keyPath).toBe(indexKeyPath);
    expect(index.unique).toBe(indexOptions.unique);
    expect(index.multiEntry).toBe(indexOptions.multiEntry);
    index = result.transaction(storeName).objectStore(storeName).index(indexNames[1]);
    expect(index.keyPath).toBe(indexKeyPath);
    expect(index.unique).toBeFalsy();
    expect(index.multiEntry).toBeFalsy();
    done();
  });
});

it('overrides indices with given params', (done) => {
  const indexNames = ['a', 'a'];
  const indexKeyPath = 'test';
  expect.assertions(3);
  const indexOptions: IDBIndexParameters = {
    multiEntry: true,
    unique: true,
  };
  const store = getStore({
    indexes: [
      { name: indexNames[0], keyPath: indexKeyPath, options: indexOptions },
      { name: indexNames[1], keyPath: indexKeyPath },
    ],
  });
  const config = getConfig({
    objectStores: [store],
  });

  open(config).then((result) => {
    const storeName = config.objectStores[0].name;
    let index = result.transaction(storeName).objectStore(storeName).index(indexNames[0]);
    index = result.transaction(storeName).objectStore(storeName).index(indexNames[1]);
    expect(index.keyPath).toBe(indexKeyPath);
    expect(index.unique).toBeFalsy();
    expect(index.multiEntry).toBeFalsy();
    done();
  });
});

it('throws w/o provided params on version change', (done) => {
  expect.assertions(1);
  const store = getStore({
    data: [1, 2, 3],
  });
  store.name = undefined;
  const config = getConfig({
    objectStores: [store],
    version: 5,
  });
  const rejectionHandle = jest.fn();
  open(config).catch(() => {
    rejectionHandle();
    expect(rejectionHandle).toBeCalled();
    done();
  });
});
