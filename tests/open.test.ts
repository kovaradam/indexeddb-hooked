import { read, open } from '../src';
import { Config } from '../src/model';
import Store, { close } from '../src/store';

beforeEach(() => {
  expect(Store.getDB()).toBe(undefined);
});

it('opens db', () => {
  let success = false;
  const config: Config = {
    objectStores: [
      {
        name: 'test',
      },
    ],
    onOpenSuccess: () => {
      success = true;
    },
  };
  open(config).then((result) => {
    expect(success).toBe(true);
    expect(result.objectStoreNames).toContain(config.objectStores[0].name);
  });
});

it('populates store with primitive data and autoIncrement', () => {
  const store = {
    name: 'test',
    data: [1, 2, 3],
    options: { autoIncrement: true },
  };
  const config: Config = {
    objectStores: [store],
    onOpenSuccess: () =>
      read(store.name).then((result) => {
        expect(result.length).toBe(store.data.length);
      }),
  };
  open(config).then((result) => {
    expect(result.objectStoreNames).toContain(store.name);
  });
});

// it('fails to populate store with primitive data w/o autoIncrement', (done) => {
//   const store = {
//     name: 'test',
//     data: [1, 2, 3],
//   };
//   const config: Config = {
//     objectStores: [store],
//   };
//   open(config).then(() => {
//     read(store.name).then((result) => {
//       expect(result.length).toBe(0);
//       done();
//     });
//   });
// });
