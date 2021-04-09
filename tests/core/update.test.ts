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

it('updates items with inline key', (done) => {
  expect.assertions(1);
  const newValue = 'new';
  const store = stores[1];
  const items = [...(store.data as any[])];
  const updateValues = items.map((item) => ({ ...item, val: newValue }));
  const onComplete = (_: Event, __: UpdateResult) => {
    read(store.name).then((result) => {
      expect(result).toStrictEqual(updateValues);
      done();
    });
  };
  asyncUpdate(store.name, {
    data: updateValues.map((updateValue) => ({ value: updateValue })),
    onComplete,
  });
});

it('array update returns key array', (done) => {
  expect.assertions(2);
  function mapToKeys(item: any): any {
    return item[keyPath];
  }
  const newValue = 'new';
  const store = stores[1];
  const items = [...(store.data as any[])];
  const updateValues = items.map((item) => ({ ...item, val: newValue }));
  const onComplete = (_: Event, keys: UpdateResult) => {
    expect((keys as []).length).toBeDefined();
    read(store.name).then((result) => {
      expect(result.map(mapToKeys)).toStrictEqual(updateValues.map(mapToKeys));
      done();
    });
  };
  asyncUpdate(store.name, {
    data: updateValues.map((updateValue) => ({ value: updateValue })),
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

it('return array of undefined on array delete', (done) => {
  expect.assertions(1);
  const store = stores[1];
  const items = store.data as any[];
  const onComplete = (_: Event, keys: UpdateResult) => {
    expect(keys).toStrictEqual(items.map(() => undefined));
    done();
  };
  asyncUpdate(store.name, {
    data: items.map((item) => ({ value: null, key: item.key })),
    onComplete,
  });
});
