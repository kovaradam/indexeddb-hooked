import { useCallback, useEffect, useRef, useState } from 'react';
import AddFruit from './components/AddFruit';
import FruitsBasket from './components/FruitsBasket';
import Details from './components/Details';
import Creator from './components/Creator';
import CreatorJS from './components/CreatorJS';
import { subscribe, useUpdate } from 'indexeddb-hooked';

function App() {
  return (
    <div className="App">
      <Fruits />
      <FruitsObj />
      <FruitsObjNoKey />
      <FruitsObjKeyGenOnly />
      <FruitsObjKeyPathOnly />
      <FruitsObjMultipleKeyPathOnly />
      <Creator />
      <CreatorJS />
    </div>
  );
}

export default App;

function FruitsObjKeyGenOnly() {
  const [key, setKey] = useState<number | string>(0);
  const update = useUpdate();
  const [selector, setSelector] = useState('name');
  const [replace, setReplace] = useState(false);

  return (
    <Details name={'fruits-obj-keygen-only'}>
      <FruitsBasket storeName="fruits-obj-keygen-only" params={{ returnWithKey: true }} />
      <form onSubmit={(e) => e.preventDefault()}>
        <input placeholder="key" onChange={(e) => setKey(Number(e.target.value))} />
        <input
          placeholder="selector"
          onChange={(e) => setSelector(String(e.target.value))}
          autoComplete="on"
        />
        <input
          placeholder="name"
          onChange={(e) => {
            const value: Record<string, string> = {};
            value[selector] = String(e.target.value);
            update('fruits-obj-keygen-only', { value: value, key, replace });
          }}
          autoComplete="on"
        />
        <input
          type="checkbox"
          checked={replace}
          onChange={() => setReplace((replace) => !replace)}
        />{' '}
        Replace
      </form>
    </Details>
  );
}
function FruitsObjKeyPathOnly() {
  const [key, setKey] = useState<string>('0');
  const update = useUpdate();
  const [selector, setSelector] = useState('name');
  const [replace, setReplace] = useState(false);
  const keyPath = 'id';
  return (
    <Details name={'fruits-obj-keypath-only'}>
      <FruitsBasket
        storeName="fruits-obj-keypath-only"
        params={{ returnWithKey: true }}
      />
      <form onSubmit={(e) => e.preventDefault()}>
        <input placeholder="key" onChange={(e) => setKey(e.target.value)} />
        <input
          placeholder="selector"
          onChange={(e) => setSelector(String(e.target.value))}
          autoComplete="on"
        />
        <input
          placeholder="name"
          onChange={(e) => {
            const value: Record<string, string> = {};
            value[selector] = String(e.target.value);
            if (replace) value[keyPath] = key;
            update('fruits-obj-keypath-only', { value: value, key, replace });
          }}
          autoComplete="on"
        />
        <input
          type="checkbox"
          checked={replace}
          onChange={() => setReplace((replace) => !replace)}
        />{' '}
        Replace
      </form>
    </Details>
  );
}
function FruitsObjMultipleKeyPathOnly() {
  const [keys, setKeys] = useState<[string, string]>(['apple', 'sweet']);
  const update = useUpdate();
  const [selector, setSelector] = useState('name');
  const [replace, setReplace] = useState(false);
  const storeName = 'fruits-obj-multiple-keypath-only';
  return (
    <Details name={storeName}>
      <FruitsBasket storeName={storeName} params={{ returnWithKey: true, key: keys }} />
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder={'key1 = ' + keys[0]}
          onChange={(e) => setKeys([e.target.value, keys[1]])}
        />
        <input
          placeholder={'key2 = ' + keys[1]}
          onChange={(e) => setKeys([keys[0], e.target.value])}
        />
      </form>
      <FruitsBasket storeName={storeName} params={{ returnWithKey: true }} />
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder={'key1 = ' + keys[0]}
          onChange={(e) => setKeys([e.target.value, keys[1]])}
        />
        <input
          placeholder={'key2 = ' + keys[1]}
          onChange={(e) => setKeys([keys[0], e.target.value])}
        />
        <input
          placeholder="selector"
          onChange={(e) => setSelector(String(e.target.value))}
          autoComplete="on"
        />
        <input
          placeholder="name"
          onChange={(e) => {
            const value: Record<string, string> = {};
            value[selector] = String(e.target.value);
            if (replace) {
              value['name'] = keys[0];
              value['taste'] = keys[1];
            }
            update(storeName, {
              value: value,
              key: keys,
              replace,
            });
          }}
          autoComplete="on"
        />
        <input
          type="checkbox"
          checked={replace}
          onChange={() => setReplace((replace) => !replace)}
        />{' '}
        Replace
      </form>
    </Details>
  );
}

const Fruits: React.FC = () => {
  const [filterValue, setFilterValue] = useState(4);
  const [direction, setDirection] = useState<IDBCursorDirection>('next');
  const filter = useCallback((value) => value.length === filterValue, [filterValue]);
  const keyInputEl = useRef<HTMLInputElement>(null);
  const storeName = 'fruits';
  useEffect(() => {
    const unsub = subscribe(storeName, (key) => {
      if (!keyInputEl?.current) return;
      keyInputEl.current.value = `update key: ${key}`;
    });
    return unsub;
  }, []);

  return (
    <Details name={'fruits'}>
      <FruitsBasket params={{ direction: 'next' }} />
      <AddFruit />
      <FruitsBasket params={{ filter }} />
      <input
        autoComplete="on"
        placeholder={'name length filter = ' + filterValue}
        onChange={(e) => setFilterValue(Number(e.target.value))}
      />
      <FruitsBasket params={{ direction }} />
      <form autoComplete="on">
        <select onChange={(e) => setDirection(e.target.value as IDBCursorDirection)}>
          <option value="next">next</option>
          <option value="prev">prev</option>
          <option value="nextunique">nextunique</option>
          <option value="prevunique">prevunique</option>
        </select>
      </form>
      <input ref={keyInputEl} disabled />
    </Details>
  );
};

const FruitsObjNoKey: React.FC = () => {
  const [key, setKey] = useState<string>('apple');
  const update = useUpdate();
  const keyPath = 'name';
  const [selector, setSelector] = useState(keyPath);
  const [replace, setReplace] = useState(false);

  return (
    <Details name={'fruits-obj-nokey'}>
      <FruitsBasket storeName="fruits-obj-nokey" params={{ returnWithKey: true }} />
      <form onSubmit={(e) => e.preventDefault()}>
        <input placeholder={'key = ' + key} onChange={(e) => setKey(e.target.value)} />
        <input
          placeholder={'selector = ' + selector}
          onChange={(e) => setSelector(String(e.target.value))}
          autoComplete="on"
        />
        <input
          placeholder={'value'}
          onChange={(e) => {
            const value: Record<string, string> = {};
            value[selector] = String(e.target.value);
            // value[keyPath] = key;
            update('fruits-obj-nokey', { value: value, key, replace });
          }}
          autoComplete="on"
        />
        <input
          type="checkbox"
          checked={replace}
          onChange={() => setReplace((replace) => !replace)}
          autoComplete="on"
        />{' '}
        Replace
      </form>
    </Details>
  );
};

const FruitsObj: React.FC = () => {
  const [name, setName] = useState('apple');
  const [keyRange, setKeyRange] = useState({ lower: 2, upper: 3 });
  const [index, setIndex] = useState('by_name');
  const [selector, setSelector] = useState('name');
  const [key, setKey] = useState<number>(0);
  const update = useUpdate();
  const [replace, setReplace] = useState(false);
  const keyPath = 'id';
  return (
    <Details name={'fruits-obj'}>
      <FruitsBasket storeName="fruits-obj" />
      <FruitsBasket
        storeName="fruits-obj"
        params={{ key: name, index, returnWithKey: true }}
      />
      <form>
        <select
          placeholder="index"
          onChange={(e) => setIndex(e.target.value as IDBCursorDirection)}
        >
          <option value=""></option>
          <option value="by_name">by_name</option>
          <option value="by_color">by_color</option>
          <option value="by_taste">by_taste</option>
        </select>
        <input
          placeholder={'value = ' + name}
          onChange={(e) => setName(String(e.target.value))}
          autoComplete="on"
        />
      </form>
      <FruitsBasket storeName="fruits-obj" params={{ returnWithKey: true }} />
      <form onSubmit={(e) => e.preventDefault()} autoComplete="on">
        <input placeholder="key" onChange={(e) => setKey(Number(e.target.value))} />
        <input
          placeholder="selector"
          onChange={(e) => setSelector(String(e.target.value))}
          autoComplete="on"
        />
        <input
          placeholder="name"
          onChange={(e) => {
            const value: Record<string, string | number> = {};
            value[selector] = String(e.target.value);
            if (replace) value[keyPath] = key;
            update('fruits-obj', { value: value, key, replace });
          }}
          autoComplete="on"
        />
        <input
          type="checkbox"
          checked={replace}
          onChange={() => setReplace((replace) => !replace)}
          autoComplete="on"
        />{' '}
        Replace
      </form>
      <FruitsBasket
        storeName="fruits-obj"
        params={{
          returnWithKey: true,
          keyRange: IDBKeyRange.bound(keyRange.lower, keyRange.upper),
        }}
      />
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          placeholder={'lower bound = ' + keyRange.lower}
          onChange={(e) =>
            setKeyRange((prevRange) => ({
              ...prevRange,
              lower: Number(e.target.value),
            }))
          }
          autoComplete="on"
        />
        <input
          placeholder={'upper bound = ' + keyRange.upper}
          onChange={(e) =>
            setKeyRange((prevRange) => ({
              ...prevRange,
              upper: Number(e.target.value),
            }))
          }
          autoComplete="on"
        />
      </form>
    </Details>
  );
};
