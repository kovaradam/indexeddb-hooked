import { ReadParams, useRead } from 'indexeddb-hooked';

type Props = { params?: ReadParams<string>; storeName?: string };

const FruitsBasket: React.FC<Props> = ({ params, storeName }) => {
  const fruits = useRead<string>(storeName || 'fruits', params);

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

export default FruitsBasket;
