import { useState } from 'react';
import AddFruit from './components/AddFruit';
import FruitsBasket from './components/FruitsBasket';

function App() {
  const [filterValue, setFilterValue] = useState(4);
  const [direction, setDirection] = useState<IDBCursorDirection>('next');
  const [index, setIndex] = useState('by_name');
  const [name, setName] = useState('apple');

  return (
    <div className="App">
      <FruitsBasket params={{ direction: 'next' }} />
      <AddFruit />
      <FruitsBasket params={{ filter: (value) => value.length === filterValue }} />
      <input onChange={(e) => setFilterValue(Number(e.target.value))} />
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
    </div>
  );
}

export default App;
