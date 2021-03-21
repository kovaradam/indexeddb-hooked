import { useContext } from 'react';
import { Context, DBContext } from '../provider';

function useDB(): Context {
  const value = useContext(DBContext);
  if (!value) {
    throw new Error('Error: IndexedDB hooks must be used within an IndexedDBProvider!');
  }
  return value;
}

export default useDB;
