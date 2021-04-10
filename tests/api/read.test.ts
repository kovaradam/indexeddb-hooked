import { open, read } from '../../src';
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

it('resolves promise on read', (done) => {
  const store = stores[0];
  expect.assertions(1);
  read(store.name).then(() => {
    expect(true).toBe(true);
    done();
  });
});

it('reads data from store', (done) => {
  const store = stores[0];
  expect.assertions(1);
  read(store.name).then((result: ReadResult<typeof store.data>) => {
    expect(result).toStrictEqual(store.data);
    done();
  });
});

it('throws on read from unknown store', (done) => {
  expect.assertions(1);
  read('unknown').catch((result) => {
    expect(result).toBeTruthy();
    done();
  });
});

it('returns data in prev direction', (done) => {
  const store = stores[0];
  expect.assertions(1);
  read(store.name, { direction: 'prev' }).then(
    (result: ReadResult<typeof store.data>) => {
      expect(result).toStrictEqual([...store.data].reverse());
      done();
    },
  );
});

it('returns filtered data', (done) => {
  const store = stores[0];
  expect.assertions(1);
  read(store.name, { filter: (i) => i !== store.data[0] }).then(
    (result: ReadResult<typeof store.data>) => {
      expect(result).toStrictEqual(store.data.slice(1));
      done();
    },
  );
});

it('returns filtered data in prev direction', (done) => {
  const store = stores[0];
  expect.assertions(1);
  read(store.name, {
    filter: (i) => i !== store.data[0],
    direction: 'prev',
  }).then((result: ReadResult<typeof store.data>) => {
    expect(result).toStrictEqual(store.data.slice(1).reverse());
    done();
  });
});

it('returns filtered data in prev direction', (done) => {
  const store = stores[0];
  expect.assertions(1);
  read(store.name, {
    filter: (i) => i !== store.data[0],
    direction: 'prev',
  }).then((result: ReadResult<typeof store.data>) => {
    expect(result).toStrictEqual(store.data.slice(1).reverse());
    done();
  });
});

it('returns data with key', (done) => {
  const store = stores[1];
  expect.assertions(1);
  read(store.name, {
    returnWithKey: true,
  }).then((result: ReadResult<typeof store.data>) => {
    expect(result).toStrictEqual(
      [...store.data].map((val: any) => ({
        key: val[keyPath],
        value: val,
      })),
    );
    done();
  });
});

it('returns one item by key', (done) => {
  const store = stores[1];
  expect.assertions(1);
  read(store.name, {
    key: store.data[0][keyPath],
  }).then((result) => {
    expect(result).toStrictEqual(store.data[0]);
    done();
  });
});

it('returns one item by multiple keys', (done) => {
  const store = stores[2];
  expect.assertions(1);
  read(store.name, {
    key: [store.data[0][keyPath], store.data[0][keyPath2]],
  }).then((result) => {
    expect(result).toStrictEqual(store.data[0]);
    done();
  });
});

it('returns null on non-existent key', (done) => {
  const store = stores[1];
  expect.assertions(1);
  read(store.name, {
    key: -1,
  }).then((result) => {
    expect(result).toStrictEqual(null);
    done();
  });
});

it('returns null on non-existent key combination', (done) => {
  const store = stores[2];
  expect.assertions(1);
  read(store.name, {
    key: [store.data[0][keyPath], store.data[1][keyPath2]],
  }).then((result) => {
    expect(result).toStrictEqual(null);
    done();
  });
});

it('returns bound keys', (done) => {
  const store = stores[1];
  const [lower, upper] = [1, 3];
  expect.assertions(1);
  read(store.name, {
    keyRange: IDBKeyRange.bound(lower, upper),
  }).then((result) => {
    expect(result).toStrictEqual(
      (store.data as any[])
        .filter(({ key }) => key >= lower)
        .filter(({ key }) => key <= upper),
    );
    done();
  });
});

it('returns lower bound keys', (done) => {
  const store = stores[1];
  const [lower] = [1];
  expect.assertions(1);
  read(store.name, {
    keyRange: IDBKeyRange.lowerBound(lower),
  }).then((result) => {
    expect(result).toStrictEqual((store.data as any[]).filter(({ key }) => key >= lower));
    done();
  });
});

it('returns upper bound keys', (done) => {
  const store = stores[1];
  const [upper] = [1];
  expect.assertions(1);
  read(store.name, {
    keyRange: IDBKeyRange.upperBound(upper),
  }).then((result) => {
    expect(result).toStrictEqual((store.data as any[]).filter(({ key }) => key <= upper));
    done();
  });
});
