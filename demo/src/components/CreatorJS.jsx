import { useRef, useState } from 'react';
import { useUpdate } from 'indexeddb-hooked';
import Details from './Details';

const Creator = () => {
  const update = useUpdate();
  const [storeName, setStoreName] = useState('fruits-no-listener');
  const textAreaEl = useRef(null);

  const onValueSubmit = (e) => {
    e.preventDefault();
    const value = JSON.parse(textAreaEl.current?.value || '');
    update(storeName, { value });
  };

  return (
    <Details name={storeName}>
      <form onSubmit={onValueSubmit}>
        <input
          placeholder={`storename = ${storeName}`}
          onChange={(e) => setStoreName(e.target.value)}
        />
        <textarea ref={textAreaEl} />
        <button type="submit">Add object</button>
      </form>
    </Details>
  );
};

export default Creator;
