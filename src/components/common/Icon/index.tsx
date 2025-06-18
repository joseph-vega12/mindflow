import React, { FC } from 'react';

import { forwardRef, IconProps } from '@chakra-ui/react';
import { merge } from 'lodash';
import { NotAllowedIcon } from '@chakra-ui/icons';

import { IconName } from 'types';

import { coreIcons } from './core';
import { customIcons } from './CustomIcons';

interface Props extends IconProps {
  name?: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | string;
}

export const Icon: FC<Props> = forwardRef(({ name = '', size = 'md', ...rest }, ref) => {
  const icons = merge(customIcons, coreIcons);

  const boxSizes = {
    xs: '.75em',
    sm: '1em',
    md: '1.5em',
    lg: '2em'
  };

  const RenderedIcon = icons[name] ?? NotAllowedIcon;

  // @ts-ignore
  return <RenderedIcon ref={ref} boxSize={boxSizes[size] ?? size} {...rest} />;
});
