import { useCallback, useState } from 'react';
import { useUpdate } from 'indexeddb-hooked';
import AddFruit from './components/AddFruit';
import FruitsBasket from './components/FruitsBasket';

function App() {
  const [filterValue, setFilterValue] = useState(4);
  const [direction, setDirection] = useState<IDBCursorDirection>('next');
  const [index, setIndex] = useState('by_name');
  const [name, setName] = useState('apple');
  const [key, setKey] = useState<number | string>(0);
  const [selector, setSelector] = useState('name');
  const [replace, setReplace] = useState(false);
  const update = useUpdate();

  const filter = useCallback((value) => value.length === filterValue, [filterValue]);

  return (
    <div className="App">
      <FruitsBasket params={{ direction: 'next' }} />
      <AddFruit />
      <FruitsBasket params={{ filter }} />
      <input
        placeholder="name length filter"
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
      <FruitsBasket storeName="fruits-obj" />
      <FruitsBasket
        storeName="fruits-obj"
        params={{ key: name, index, returnWithKey: true }}
      />
      <form>
        <select onChange={(e) => setIndex(e.target.value as IDBCursorDirection)}>
          <option value=""></option>
          <option value="by_name">by_name</option>
          <option value="by_color">by_color</option>
          <option value="by_taste">by_taste</option>
        </select>
        <input onChange={(e) => setName(String(e.target.value))} />
      </form>
      <FruitsBasket storeName="fruits-obj" params={{ returnWithKey: true }} />
      <form onSubmit={(e) => e.preventDefault()}>
        <input placeholder="key" onChange={(e) => setKey(Number(e.target.value))} />
        <input
          placeholder="selector"
          onChange={(e) => setSelector(String(e.target.value))}
        />
        <input
          placeholder="name"
          onChange={(e) => {
            const value: Record<string, string> = {};
            value[selector] = String(e.target.value);
            update('fruits-obj', { value: value, key, replace });
          }}
        />
        <input
          type="checkbox"
          checked={replace}
          onChange={() => setReplace((replace) => !replace)}
        />{' '}
        Replace
      </form>
      <FruitsBasket storeName="fruits-obj-nokey" params={{ returnWithKey: true }} />
      <form onSubmit={(e) => e.preventDefault()}>
        <input placeholder="key" onChange={(e) => setKey(e.target.value)} />
        <input
          placeholder="selector"
          onChange={(e) => setSelector(String(e.target.value))}
        />
        <input
          placeholder="name"
          onChange={(e) => {
            const value: Record<string, string> = {};
            value[selector] = String(e.target.value);
            update('fruits-obj-nokey', { value: value, key, replace });
          }}
        />
        <input
          type="checkbox"
          checked={replace}
          onChange={() => setReplace((replace) => !replace)}
        />{' '}
        Replace
      </form>
    </div>
  );
}

export default App;
