import React, { FC } from 'react';

import {
  Box as ChakraBox,
  BoxProps as ChakraBoxProps,
  Divider as ChakraDivider,
  Heading as ChakraHeading
} from '@chakra-ui/react';
import { Property } from 'csstype';

export interface BaseCardProps extends ChakraBoxProps {
  title?: string;
  alignText?: Property.TextAlign;
}

export const BaseCard: FC<BaseCardProps> = ({ title, alignText, children, ...props }) => (
  <ChakraBox boxShadow="md" borderRadius="md" padding="md" {...props}>
    {title && (
      <ChakraBox width="100%">
        <ChakraHeading
          isTruncated
          color="ui.600"
          marginBottom="sm"
          fontSize="md"
          fontWeight="600"
          textAlign={alignText ?? 'start'}
        >
          {title}
        </ChakraHeading>
        <ChakraDivider borderColor="gray" marginBottom="md" />
      </ChakraBox>
    )}
    {children}
  </ChakraBox>
);
