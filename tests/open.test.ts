import { read, open } from '../src';
import { Config } from '../src/model';
import Store, { close } from '../src/store';

let counter = 0;

function getConfig(config: Config): Config {
  return { ...config, name: `db${++counter}` };
}

beforeEach(() => {
  if (Store.getDB()) {
    close();
  }
});

it('opens db', (done) => {
  let success = false;
  const config = getConfig({
    name: 'new',
    objectStores: [
      {
        name: 'test',
      },
    ],
    onOpenSuccess: () => {
      success = true;
    },
  });
  open(config).then((result) => {
    expect(success).toBe(true);
    expect(result.objectStoreNames).toContain(config.objectStores[0].name);
    result.close();
    done();
  });
});

it('populates store with primitive data and autoIncrement', (done) => {
  expect.assertions(1);
  const store = {
    name: 'test',
    data: [1, 2, 3],
    options: { autoIncrement: true },
  };
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
  const store = {
    name: 'test',
    data: [1, 2, 3],
    options: { autoIncrement: true },
  };
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

it('throws when populating store with primitive data w/o autoIncrement', () => {
  expect.assertions(1);
  const store = {
    name: 'test',
    data: [1, 2, 3],
  };
  const config = getConfig({
    objectStores: [store],
  });
  expect(open).toThrowError();
  open(config);
});
