<p align="center">
  <img width="300" src="logo.svg" />
</p>

[![npm](https://img.shields.io/npm/v/indexeddb-hooked)](https://www.npmjs.com/package/indexeddb-hooked)
[![Coverage Status](https://coveralls.io/repos/github/kovaradam/indexeddb-hooked/badge.svg?branch=main)](https://coveralls.io/github/kovaradam/indexeddb-hooked?branch=main)

A small, reactive IndexedDB binding for React.

```bash
npm i indexeddb-hooked
```

### Initialize a DB

You define your schema in a `config` object and establish a database connection via `open` function somewhere in your app.

```jsx
import React from 'react';
import { open } from 'indexeddb-hooked';

const config = {
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
      indexes: [{ name: 'by_name', keyPath: 'name', options: { unique: true } }],
    },
  ],
  onOpenSuccess: () => console.log('DB is open and delicious'),
};

open(config);

const App = () => {
  return (
      <div>...</div>
  );
};

export default App;
```

<details>
<summary>Config parameters</summary>
 
|Value| |Type|
| - | - | -: |
| `name?` | Name of your database | `string` |
| `version?` | Current [version](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#opening_a_database) of your database | `unsigned long long` |
| `objectStores` | Definition of your object stores | [ObjectStoreParams[]](#objectstoreparams) |
| `onOpenSuccess?` | Callback function called if the [IDBFactory.open](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/open) request was successful | [IDBRequest.onsuccess](https://developer.mozilla.org/en-US/docs/Web/API/IDBRequest/onsuccess) |
| `onOpenError?` | Callback function fired when the open request returns an error. | [IDBRequest.onerror](https://developer.mozilla.org/en-US/docs/Web/API/IDBRequest/onerror) |
| `onUpgradeNeeded?` | Callback function fired when the database doesn't already exist or if version number is upgraded. Specify this event handler in case you want full control over the creation of your database schema. |`(event, objectStores) => void` |

</details>

### Request your data

Once the IDB is open, you access your data via `useRead` hook:

```jsx
import React from 'react';
import { useRead } from 'indexeddb-hooked';

const FruitsBasket = () => {
  const [fruits, { isLoading, error }] = useRead('fruits');
  /* Since IDB operations are asynchronous, useRead returns `null`
   (or previous result) at first, then triggers render once the data is obtained.*/

  if (isLoading) return <div>Loading</div>;
  /* You can use isLoading boolean flag and error string 
   to reflect transaction state */
  if (error) return <div>{error}</div>;

  return (
    <ul>
      {fruits.map((fruit) => (
        <li>{fruit}</li>
      ))}
    </ul>
  );
};
```

To read from IDB, you must specify name of the store you want to read from as a first argument of the `useRead` function.

#### Read parameters

To specify request, you must provide a second argument in a form of an object. If only store name is provided, `useRead` returns all data from specified store.
|Value||Type|
| - | - | -: |
| `key?` | Returns first data entry with given key | [IDBValidKey](https://microsoft.github.io/PowerBI-JavaScript/modules/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.html#idbvalidkey) |
| `keyRange?` | Returns entries within given key range | [IDBKeyRange](https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange) |
| `direction?` | Specify direction of read result | `next`, `nextunique`, `prev`, `prevunique` |
| `index?` | Specify index to search by other value than the primary key | `string` |
| `filter?` | Filter function | `(value) => boolean` |
| `returnWithKey?` | Data is returned with its key in a form of `{ value, key }` object | `boolean` |

<details>
  <summary>Example</summary>
  
  ```jsx
import React from 'react';
import { useRead } from 'indexeddb-hooked';

const FruitsBasket = () => {
  const fruits = useRead('fruits',{
    returnWithKey: true,
    keyRange: IDBKeyRange.bound(0, 2),
    direction:'prev'
  });

  if (!fruits) return <div>Loading</div>;
  
  return (
    <ul>
      {fruits.map((result) => (
        <li key={result.key}>{result.value}</li>
      ))}
    </ul>
  );
};
  ```

</details>

### Update your data

All data manipulation is happening through `update` function returned from `useUpdate` hook:

```jsx
import React from 'react';
import { useUpdate } from 'indexeddb-hooked';

const AddFruit = () => {
  const [update, { result, error }] = useUpdate();
  const inputEl = useRef(null);

  if (error) console.log(error);

  if (result) console.log(`Added fruit with key ${result}`);

  const onSubmit = (e) => {
    e.preventDefault();
    update('fruits', { value: inputEl.current.value });
  };

  return (
    <form onSubmit={onSubmit}>
      <input ref={inputEl} />
      <button type="submit">Add fruit</button>
    </form>
  );
};
```

Update triggers re-render on components that read from the updated object store only. You can prevent this rendering by setting the third optional argument of the `update` function to `false`.

#### Update parameters

Behaviour of the update function depends on the [definition of your object stores](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#structuring_the_database).

To specify update operation, you must provide a second argument in a form of an object.
|Value||Type|
| - | - | -: |
| `value` | Your input data | `boolean`, `number`, `string`, `date`, `object`, `array`, `regexp`, `undefined`, `Blob`,`File`, `null` |
| `key?` | Key of the modified data entry | [IDBValidKey](https://microsoft.github.io/PowerBI-JavaScript/modules/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.html#idbvalidkey) |
| `replace?` | If true, then input data overrides (not merges with) the old data entry | `boolean` |

### Deleting data

Delete your data by specifying `key` and setting the `value` update parameter to `null`.

### Other types

#### ObjectStoreParams
  
|Value||Type|
|-|-|-:|
| `name` | Name of the object store | `string` |
| `options?` | Specify [supply](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#structuring_the_database) of your value keys by a [key path](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Concepts_Behind_IndexedDB#gloss_keypath) or a [key generator](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Concepts_Behind_IndexedDB#gloss_keygenerator) | [IDBObjectStoreParameters](#idbobjectstoreparameters) |
| `indexes?` | Array containing parameters of indices to create on the database | [IndexParams[]](#indexparams) |
| `data?` | Input data entries | `boolean[]`, `number[]`, `string[]`, `date[]`, `object[]`, `array[]`, `regexp[]`, `undefined[]`, `Blob[]`,`File[]` |


#### IDBObjectStoreParameters
 
|Value||Type|
| - | - | -: |
| `keyPath?` | Defines which value of input object is used as a key. If empty or not specified, the object store is created without a key path and uses [out-of-line](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Concepts_Behind_IndexedDB#gloss_outofline_key) keys. | `string`,`string[]` |
| `autoIncrement?` | If `true`, the object store has a [key generator](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Concepts_Behind_IndexedDB#gloss_keygenerator). Defaults to `false`. | `boolean` |

#### IndexParams
|Value||Type|
| - | - | -: |
| `name` | Name of the index | `string` |
| `keyPath?` | The key path for the index to use | `string`,`string[]` |
| `options?` | An object with other index attributes | [IDBIndexParameters](#idbindexparameters) |

#### IDBIndexParameters 
|Value||Type|
| - | - | -: |
| `unique?` | If true, the index will not allow duplicate values for a single key. | `boolean` |
| `multiEntry?` | If `true`, the index will add an entry in the index for each array element when the `keyPath` resolves to an Array. If `false`, it will add one single entry containing the Array. | `boolean` |

### Usage outside React components

You can also use promise-based alternatives to `useRead` and `useUpdate` functions, like so:

```ts
import { read, update } from 'indexeddb-hooked';

read('fruits').then(result => console.log(result));

// result is the key or key array of modified object(s)  
update('fruits', { value: 'pear' }).then(result => console.log(result);
```

Be sure to use these functions after the database connection has been established. 

#### Reacting to store changes

In case you need to react to changes outside of React, you can subscribe listeners to specified store:

```ts
import { subscribe } from 'indexeddb-hooked';

// returns function to unsubscribe the listener 
// result is the key or key array of modified object(s)  
const unsub = subscribe('fruits', result => console.log(result));
```


