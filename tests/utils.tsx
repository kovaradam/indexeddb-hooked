import { ObjectStoreParams } from '../src';

export const keyPath = 'key';
export const keyPath2 = 'key2';

export const stores: ObjectStoreParams[] = [
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

export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
