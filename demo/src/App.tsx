import { useCallback, useState } from 'react';
import { useUpdate } from 'indexeddb-hooked';
import AddFruit from './components/AddFruit';
import FruitsBasket from './components/FruitsBasket';
import Details from './components/Details';

function App() {
  return (
    <div className="App">
      <Fruits />
      <FruitsObj />
      <FruitsObjNoKey />
      <FruitsObjKeyGenOnly />
      <FruitsObjKeyPathOnly />
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
  const [key, setKey] = useState<number | string>(0);
  const update = useUpdate();
  const [selector, setSelector] = useState('name');
  const [replace, setReplace] = useState(false);

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

const Fruits: React.FC = () => {
  const [filterValue, setFilterValue] = useState(4);
  const [direction, setDirection] = useState<IDBCursorDirection>('next');
  const filter = useCallback((value) => value.length === filterValue, [filterValue]);
  return (
    <Details name={'fruits'}>
      <FruitsBasket params={{ direction: 'next' }} />
      <AddFruit />
      <FruitsBasket params={{ filter }} />
      <input
        placeholder={'name length filter = ' + filterValue}
        onChange={(e) => setFilterValue(Number(e.target.value))}
      />
      <FruitsBasket params={{ direction }} />
      <form>
        <select onChange={(e) => setDirection(e.target.value as IDBCursorDirection)}>
          <option value="next">next</option>
          <option value="prev">prev</option>
          <option value="nextunique">nextunique</option>
          <option value="prevunique">prevunique</option>
        </select>
      </form>
    </Details>
  );
};

const FruitsObjNoKey: React.FC = () => {
  const [key, setKey] = useState<number | string>(0);
  const update = useUpdate();
  const [selector, setSelector] = useState('name');
  const [replace, setReplace] = useState(false);

  return (
    <Details name={'fruits-obj-nokey'}>
      <FruitsBasket storeName="fruits-obj-nokey" params={{ returnWithKey: true }} />
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
  const [key, setKey] = useState<number | string>(0);
  const update = useUpdate();
  const [replace, setReplace] = useState(false);
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
          placeholder={'key value = ' + name}
          onChange={(e) => setName(String(e.target.value))}
          autoComplete="on"
        />
      </form>
      <FruitsBasket storeName="fruits-obj" params={{ returnWithKey: true }} />
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
