import { DBRecord, ReadParams, useRead, useUpdate } from 'indexeddb-hooked';

type Props = { params?: ReadParams<DBRecord>; storeName?: string };

const FruitsBasket: React.FC<Props> = ({ params, storeName }) => {
  const fruits = useRead<DBRecord>(storeName || 'fruits', {
    ...params,
    returnWithKey: true,
  });

  if (!fruits) return <div>Loading</div>;
  /* Since IDB operations are asynchronous, useRead returns `null`
     (or previous result) at first, then triggers render once the data is obtained.*/

  return (
    <ul>
      {fruits.length ? (
        fruits.map((fruit) => (
          <ListItem key={'' + fruit.key} id={fruit.key} storeName={storeName}>
            {fruit}
          </ListItem>
        ))
      ) : (
        <ListItem id={(fruits as any).key} storeName={storeName}>
          {fruits}
        </ListItem>
      )}
    </ul>
  );
};

export default FruitsBasket;

const ListItem: React.FC<{ id: IDBValidKey } & Props> = ({ id, children, storeName }) => {
  const update = useUpdate();
  return (
    <li onClick={() => update(storeName || 'fruits', { value: null, key: id })}>
      <code>{JSON.stringify(children)}</code>
    </li>
  );
};
