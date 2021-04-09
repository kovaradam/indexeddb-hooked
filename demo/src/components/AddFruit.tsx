import { useRef } from 'react';
import { useUpdate } from 'indexeddb-hooked';

const AddFruit = () => {
  const [update] = useUpdate<string>();
  const inputEl = useRef<HTMLInputElement | null>(null);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const value = inputEl.current?.value || '';
    update('fruits', { value });
  };

  return (
    <form onSubmit={onSubmit}>
      <input ref={inputEl} />
      <button type="submit">Add fruit</button>
    </form>
  );
};

export default AddFruit;
