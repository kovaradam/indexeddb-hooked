import { Config } from 'indexeddb-hooked';

const config: Config = {
  name: 'FruitDB',
  version: 1,
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
      data: [
        { color: 'green', taste: 'sweet', name: 'apple' },
        { color: 'red', taste: 'sweet', name: 'cherry' },
        { color: 'yellow', taste: 'sour', name: 'lemon' },
      ],
    },
  ],
  onOpenSuccess: () => console.log('DB is open and delicious'),
};

export default config;
