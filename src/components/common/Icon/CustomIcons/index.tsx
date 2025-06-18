import { ReactNode } from 'react';

import { createIcon } from '@chakra-ui/react';

import { customIconsObj } from './customIcons';

export const customIcons: Record<string, ReactNode> = Object.entries(customIconsObj).reduce(
  (prev, [key, { path, viewBox }]) => {
    return {
      ...prev,
      [key]: createIcon({ displayName: key, viewBox, path })
    };
  },
  {}
);
