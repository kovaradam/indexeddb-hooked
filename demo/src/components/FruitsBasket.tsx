import { DBRecord, ReadParams, useRead } from 'indexeddb-hooked';

type Props = { params?: ReadParams<DBRecord>; storeName?: string };

const FruitsBasket: React.FC<Props> = ({ params, storeName }) => {
  const fruits = useRead<DBRecord>(storeName || 'fruits', params);

  if (!fruits) return <div>Loading</div>;
  /* Since IDB operations are asynchronous, useRead returns `null`
     (or previous result) at first, then triggers render once the data is obtained.*/

  return (
    <ul>
      {fruits.length ? (
        fruits.map((fruit) => <li>{JSON.stringify(fruit)}</li>)
      ) : (
        <li>{JSON.stringify(fruits)}</li>
      )}
    </ul>
  );
};

export default FruitsBasket;
