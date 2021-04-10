import { DBRecord, ReadParams, useRead, useUpdate } from 'indexeddb-hooked';

type Props = { params?: ReadParams<DBRecord>; storeName?: string };

const FruitsBasket: React.FC<Props> = ({ params, storeName }) => {
  const [fruits, error] = useRead(storeName || 'fruits', {
    ...params,
    returnWithKey: true,
  });

  if (error) console.log('error:', error);

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
  const [update, { error }] = useUpdate<string>();

  if (error) console.log(error);

  return (
    <li onClick={() => update(storeName || 'fruits', { value: null, key: id })}>
      <code>{JSON.stringify(children)}</code>
    </li>
  );
};
