import { useState } from 'react';
import AddFruit from './components/AddFruit';
import FruitsBasket from './components/FruitsBasket';

function App() {
  const [filterValue, setFilterValue] = useState(4);
  const [direction, setDirection] = useState<IDBCursorDirection>('next');

  return (
    <div className="App">
      <FruitsBasket params={{ direction: 'next' }} />
      <AddFruit />
      <FruitsBasket params={{ filter: (value) => value.length === filterValue }} />
      <form>
        <input onChange={(e) => setFilterValue(Number(e.target.value))} />
      </form>
      <FruitsBasket params={{ direction }} />
      <form>
        <select onChange={(e) => setDirection(e.target.value as IDBCursorDirection)}>
          <option value="prev">prev</option>
          <option value="next">next</option>
          <option value="prevunique">prevunique</option>
          <option value="nextunique">nextunique</option>
        </select>
      </form>
    </div>
  );
}

export default App;
