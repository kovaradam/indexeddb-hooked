import Store from '../src/store';

it('subscribes store listener', () => {
  const storeName = 'test';
  expect(Store.subscriptions[storeName]).toBe(undefined);
  Store.subscribe(storeName, console.log);
  expect(Store.subscriptions[storeName].listeners.length).toBe(1);
});

it('unbscribes store listener', () => {
  const storeName = 'test';
  const unsub = Store.subscribe(storeName, console.log);
  unsub();
  expect(Store.subscriptions[storeName].listeners.length).toBe(0);
});

it('notifies all store listeners', () => {
  const storeName = 'test';
  const resultArray = [];
  const listenerCount = 3;
  for (let i = 0; i < listenerCount; i++) {
    Store.subscribe(storeName, (num) => resultArray.push(num));
  }
  Store.notify(storeName, 1);
  expect(resultArray.length).toBe(listenerCount);
});

it('notifies all specified store listeners only', () => {
  const storeNames = ['a', 'b'];
  const resultArray = [[], []];
  const listenerCount = 3;
  for (let ii = 0; ii < storeNames.length; ii++) {
    for (let i = 0; i < listenerCount; i++) {
      Store.subscribe(storeNames[ii], (num) => resultArray[ii].push(num));
    }
  }
  Store.notify(storeNames[0], 1);
  expect(resultArray[0].length).toBe(listenerCount);
  expect(resultArray[1].length).toBe(0);
});

it('notifies all store listeners on wake', () => {
  const storeNames = ['a', 'b'];
  const resultArray = [[], []];
  const listenerCount = 3;
  for (let ii = 0; ii < storeNames.length; ii++) {
    for (let i = 0; i < listenerCount; i++) {
      Store.subscribe(storeNames[ii], (num) => resultArray[ii].push(num));
    }
  }
  Store.wake();
  expect(resultArray[0].length + resultArray[1].length).toBe(
    listenerCount * storeNames.length,
  );
});
