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
      name: 'fruit-lists',
      options: { keyPath: 'id', autoIncrement: true },
      indexes: [
        { name: 'by_name', keyPath: 'name', options: { unique: true, locale: 'auto' } },
      ],
    },
  ],
  onOpenSuccess: () => console.log('DB is open and delicious'),
};

export default config;
