import { Config, read, subscribe, update } from 'indexeddb-hooked';

const objData = [
  { color: 'green', taste: 'sweet', name: 'apple' },
  { color: 'red', taste: 'sweet', name: 'cherry' },
  { color: 'yellow', taste: 'sour', name: 'lemon' },
];

const config: Config = {
  name: 'FruitDB',
  version: 2,
  objectStores: [
    {
      name: 'fruits',
      options: { autoIncrement: true },
      data: ['apple', 'banana', 'kiwi'],
    },
    {
      name: 'fruits-obj',
      options: { keyPath: 'id', autoIncrement: true },
      // +keypath -autoIncrement: values must have the key value, value is not generated separately
      // +keypath +autoIncrement: values dont have to have key value, value can be generated separately
      indexes: [
        { name: 'by_name', keyPath: 'name', options: { unique: true } },
        { name: 'by_taste', keyPath: 'taste' },
        { name: 'by_color', keyPath: 'color' },
      ],
      data: objData,
    },
    {
      name: 'fruits-obj-nokey',
      data: objData,
      dataKey: 'name',
    },
    {
      name: 'fruits-obj-keygen-only',
      options: { autoIncrement: true },
      data: objData,
    },
    {
      name: 'fruits-obj-keypath-only',
      options: { keyPath: 'id' },
      data: objData.map((data: Record<string, unknown>) => {
        return { ...data, id: (Math.random() * 100).toFixed(0) };
      }),
    },
    {
      name: 'fruits-obj-multiple-keypath-only',
      options: { keyPath: ['name', 'taste'] },
      data: objData,
    },
    {
      name: 'fruits-no-listener',
      options: { autoIncrement: true },
    },
  ],
  onOpenSuccess: onOpen,
  _isDevelopment: true,
};

export default config;

function onOpen() {
  read('fruits').then(console.log);
  subscribe('fruits', (result) => console.log(result));
  update('fruits', [{ value: 'pear' }]);
  update('fruits', { value: 'apple' });
}
