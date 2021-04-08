import { open } from '../../src';
import { asyncRead } from '../../src/core/read';
import { Config, ObjectStoreParams, ReadResult } from '../../src/model';

const keyPath = 'key';
const keyPath2 = 'key2';

const stores: ObjectStoreParams[] = [
  {
    name: 'test',
    data: [1, 2, 3],
    options: { autoIncrement: true },
  },
  {
    name: 'testWithKey',
    data: [{ [keyPath]: 1 }, { [keyPath]: 2 }, { [keyPath]: 3 }],
    options: { keyPath },
  },
  {
    name: 'testWithKeys',
    data: [
      { [keyPath]: 1, [keyPath2]: 1 },
      { [keyPath]: 2, [keyPath2]: 2 },
      { [keyPath]: 3, [keyPath2]: 3 },
    ],
    options: { keyPath: [keyPath, keyPath2] },
  },
];

beforeAll((done) => {
  const config: Config = {
    objectStores: stores,
  };
  open(config).then(() => done());
});

it('calls onSuccess on read from store', (done) => {
  const store = stores[0];
  expect.assertions(1);
  const onSuccess = () => {
    expect(true).toBe(true);
    done();
  };
  asyncRead(store.name, { onSuccess });
});

it('calls onSuccess on read from store', (done) => {
  const store = stores[0];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual(store.data);
    done();
  };
  asyncRead(store.name, { onSuccess });
});

it('calls onError on read from unknown store', (done) => {
  const store = stores[0];
  expect.assertions(1);
  const onSuccess = () => {};
  const onError = () => {
    expect(true).toBe(true);
    done();
  };
  asyncRead(store.name + 'unknown', { onSuccess, onError });
});

it('returns data in prev direction', (done) => {
  const store = stores[0];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual([...store.data].reverse());
    done();
  };
  asyncRead(store.name, { onSuccess, direction: 'prev' });
});

it('returns filtered data', (done) => {
  const store = stores[0];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual(store.data.slice(1));
    done();
  };
  asyncRead(store.name, { onSuccess, filter: (i) => i !== store.data[0] });
});

it('returns filtered data in prev direction', (done) => {
  const store = stores[0];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual(store.data.slice(1).reverse());
    done();
  };
  asyncRead(store.name, {
    onSuccess,
    filter: (i) => i !== store.data[0],
    direction: 'prev',
  });
});

it('returns filtered data in prev direction', (done) => {
  const store = stores[0];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual(store.data.slice(1).reverse());
    done();
  };
  asyncRead(store.name, {
    onSuccess,
    filter: (i) => i !== store.data[0],
    direction: 'prev',
  });
});

it('returns data with key', (done) => {
  const store = stores[1];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual(
      [...store.data].map((val: any) => ({
        key: val[keyPath],
        value: val,
      })),
    );
    done();
  };
  asyncRead(store.name, {
    onSuccess,
    returnWithKey: true,
  });
});

it('returns one item by key', (done) => {
  const store = stores[1];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual(store.data[0]);
    done();
  };
  asyncRead(store.name, {
    onSuccess,
    key: store.data[0][keyPath],
  });
});

it('returns one item by multiple keys', (done) => {
  const store = stores[2];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual(store.data[0]);
    done();
  };
  asyncRead(store.name, {
    onSuccess,
    key: [store.data[0][keyPath], store.data[0][keyPath2]],
  });
});

it('returns null on non-existent key', (done) => {
  const store = stores[1];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual(null);
    done();
  };
  asyncRead(store.name, {
    onSuccess,
    key: -1,
  });
});

it('returns null on non-existent key combination', (done) => {
  const store = stores[2];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual(null);
    done();
  };
  asyncRead(store.name, {
    onSuccess,
    key: [store.data[0][keyPath], store.data[1][keyPath2]],
  });
});

it('returns bound keys', (done) => {
  const store = stores[1];
  const [lower, upper] = [1, 3];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual(
      (store.data as any[])
        .filter(({ key }) => key >= lower)
        .filter(({ key }) => key <= upper),
    );
    done();
  };
  asyncRead(store.name, {
    onSuccess,
    keyRange: IDBKeyRange.bound(lower, upper),
  });
});

it('returns lower bound keys', (done) => {
  const store = stores[1];
  const [lower] = [1];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual((store.data as any[]).filter(({ key }) => key >= lower));
    done();
  };
  asyncRead(store.name, {
    onSuccess,
    keyRange: IDBKeyRange.lowerBound(lower),
  });
});

it('returns upper bound keys', (done) => {
  const store = stores[1];
  const [upper] = [1];
  expect.assertions(1);
  const onSuccess = (result: ReadResult<typeof store.data>, _: Event) => {
    expect(result).toStrictEqual((store.data as any[]).filter(({ key }) => key <= upper));
    done();
  };
  asyncRead(store.name, {
    onSuccess,
    keyRange: IDBKeyRange.upperBound(upper),
  });
});
