import { useRead } from 'indexeddb-hooked';

const Juicy: React.FC = () => {
  const fruits = useRead<string[]>('fruits');

  if (!fruits) return <div>Loading</div>;
  /* Since IDB operations are asynchronous, useRead returns `null`
     (or previous result) at first, then triggers render once the data is obtained.*/

  return (
    <ul>
      {fruits.map((fruit) => (
        <li>{fruit}</li>
      ))}
    </ul>
  );
};

export default Juicy;
