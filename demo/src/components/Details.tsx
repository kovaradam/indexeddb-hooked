import { useState } from 'react';

const Details: React.FC<{ name: string }> = (props) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <details open={open}>
        <summary onClick={() => setOpen((prev) => !prev)}>
          <span>{props.name}</span>
        </summary>
      </details>
      {open && props.children}
    </>
  );
};

export default Details;
