import { Column } from 'react-table';

export const createColumns = (items: Record<string, any>[], omitKeys: string[] = []): Column[] => {
  if (!items?.length) return [];

  const keys = Object.keys(items[0]);

  return keys.reduce((prev: Column[], key) => {
    if (omitKeys?.includes(key)) return prev;

    return [
      ...prev,
      {
        Header: key,
        accessor: key
      }
    ];
  }, []);
};
