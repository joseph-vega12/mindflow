import { ButtonProps } from '@chakra-ui/react';

import { ThemeComponent } from 'types';

export type ButtonSizes = 'sm' | 'md' | 'lg' | string;
export type ButtonVariants = 'primary' | 'secondary' | 'destructive' | 'outline';

export const Button: ThemeComponent<ButtonSizes, ButtonVariants, ButtonProps> = {
  baseStyle: (props) => ({
    py: 2,
    px: 6,
    borderRadius: 'sm'
  }),

  sizes: {
    sm: {
      fontSize: 'sm',
      lineHeight: 'sm'
    },
    md: {
      fontSize: 'md',
      lineHeight: 'md'
    },
    lg: {
      fontSize: 'lg',
      lineHeight: 'lg'
    }
  },

  variants: {
    primary: ({ colorScheme = 'blue' }) => ({
      bg: `${colorScheme}.500`,
      color: 'white',
      _hover: {
        bg: `${colorScheme}.700`
      }
    }),
    secondary: ({ colorScheme = 'teal' }) => ({
      bg: `${colorScheme}.50`,
      color: `${colorScheme}.700`,
      textStyle: 'custom',
      _hover: {
        bg: `${colorScheme}.100`
      }
    }),
    outline: ({ colorScheme = 'primary' }) => ({
      bg: `${colorScheme}.50`,
      borderColor: `${colorScheme}.500`,
      border: 'sm',
      color: `${colorScheme}.500`,
      _hover: {
        bg: `${colorScheme}.100`
      }
    }),
    destructive: ({ colorScheme = 'supportA' }) => ({
      bg: `${colorScheme}.500`,
      color: 'white',
      _hover: {
        bg: `${colorScheme}.600`
      }
    })
  },

  defaultProps: {
    size: 'md',
    variant: 'primary'
  }
};
