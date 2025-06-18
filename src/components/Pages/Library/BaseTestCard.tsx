import React, { FC } from 'react';

import {
  Button as ChakraButton,
  Divider as ChakraDivider,
  Flex as ChakraFlex,
  Heading as ChakraHeading
} from '@chakra-ui/react';

import { IconName } from 'types';

import { BaseCard, Icon } from 'components/common';

interface BaseTestCardProps {
  icon: IconName;
  label: string;
  completed?: boolean;
  onClick?: () => any;
  disabled?: boolean;
}

export const BaseTestCard: FC<BaseTestCardProps> = ({
  label,
  icon,
  completed,
  onClick,
  children,
  disabled = false
}) => {
  return (
    <BaseCard padding="unset" width="100%" maxWidth="420px" height="500px">
      <ChakraFlex
        gridGap="lg"
        padding="md"
        paddingBottom="lg"
        alignItems="center"
        flexDirection="column"
        position="relative"
      >
        <ChakraFlex width="100%" justifyContent="flex-end" position="absolute" right="md">
          {completed && <Icon name="check-circle" fontSize="3xl" color="green.500" />}
        </ChakraFlex>
        <ChakraFlex justifyContent="center">
          <Icon ml={2} name={icon} fontSize="85px" />
        </ChakraFlex>
        <ChakraFlex width="fit-content" flexDirection="column" justifyContent="center">
          <ChakraHeading mb={0} fontSize="md" fontWeight="600" color="blue.800" px={1}>
            {label}
          </ChakraHeading>
          <ChakraDivider borderColor="blue.800" my={0} mt={1} />
        </ChakraFlex>
        <ChakraFlex justifyContent="center" alignItems="center" gridGap="sm">
          <ChakraFlex
            justifyContent="center"
            alignItems="center"
            borderRadius="md"
            cursor="pointer"
            height="100%"
            _hover={{ bg: 'gray.200', color: 'gray.800' }}
          >
            <Icon name="info" color="gray.400" fontSize="md" />
          </ChakraFlex>
          <ChakraButton
            size="sm"
            paddingX="lg"
            variant="outline"
            colorScheme="gray"
            onClick={onClick}
            disabled={disabled}
          >
            START
          </ChakraButton>
        </ChakraFlex>
      </ChakraFlex>

      <ChakraDivider borderColor="gray.400" />

      {children}
    </BaseCard>
  );
};
