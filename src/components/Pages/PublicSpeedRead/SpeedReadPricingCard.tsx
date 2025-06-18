import React, { FC } from 'react';

import { Flex as ChakraFlex, Heading as ChakraHeading, Text as ChakraText } from '@chakra-ui/react';

interface SpeedReadPricingCardProps {
  title: string;
  price: number;
  payment: string;
  features: string[];
}

export const SpeedReadPricingCard: FC<SpeedReadPricingCardProps> = ({ title, price, payment, features }) => {
  return (
    <ChakraFlex width="100%" flexDirection="column" border="sm" borderColor="gray.100" borderRadius="sm">
      <ChakraFlex
        width="100%"
        padding="md"
        borderBottom="sm"
        borderBottomColor="gray.100"
        justifyContent="center"
        alignItems="center"
      >
        <ChakraHeading as="h2" px={0} fontSize="xl" fontWeight="700" color="blue.500">
          {title}
        </ChakraHeading>
      </ChakraFlex>
      <ChakraFlex
        width="100%"
        padding="md"
        borderBottom="sm"
        borderBottomColor="gray.100"
        justifyContent="center"
        alignItems="center"
      >
        <ChakraHeading as="h2" px={0} fontSize="4xl" fontWeight="600" color="teal.500">
          <ChakraText as="span" fontSize="md" color="gray.500" bottom="10px" position="relative" fontWeight="500">
            $
          </ChakraText>
          {price}
          <ChakraText as="span" fontStyle="italic" fontSize="xs" color="gray.500" fontWeight="500">
            {payment}
          </ChakraText>
        </ChakraHeading>
      </ChakraFlex>
      <ChakraFlex width="100%" flexDirection="column">
        {features.map((feature, idx) => (
          <ChakraFlex
            key={idx}
            padding="md"
            borderBottom="sm"
            borderBottomColor="gray.100"
            _last={{ borderBottom: 'none' }}
            justifyContent="center"
            alignItems="center"
          >
            <ChakraText fontSize="md" color="gray.600">
              {feature}
            </ChakraText>
          </ChakraFlex>
        ))}
      </ChakraFlex>
    </ChakraFlex>
  );
};
