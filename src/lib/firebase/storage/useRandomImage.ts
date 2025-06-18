import { useMemo } from 'react';

export const useRandomImage = (): [url: string] => {
  const randomImageId = useMemo(() => Math.floor(Math.random() * 30) + 1, []);
  const IMAGE_URL = `https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/backgrounds%2F${randomImageId}.jpg?alt=media`;

  // @ts-ignore
  return [IMAGE_URL];
};
