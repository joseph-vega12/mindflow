import { FormLabelProps } from '@chakra-ui/react';

import { ThemeComponent } from 'types';

export const FormLabel: ThemeComponent<null, null, FormLabelProps> = {
  baseStyle: ({ colorScheme }) => ({
    fontSize: 'md',
    fontWeight: '400',
    color: `${colorScheme}.600`
  }),

  defaultProps: {
    colorScheme: 'gray'
  }
};
