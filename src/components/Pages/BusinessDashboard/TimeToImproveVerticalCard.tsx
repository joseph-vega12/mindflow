import React, { FC } from 'react';

import { Flex as ChakraFlex, FlexProps as ChakraFlexProps, Text as ChakraText } from '@chakra-ui/react';

import { AverageCard } from '../Business/Home';
import { BaseCard, Icon } from 'components/common';

export const TimeToImproveVerticalCard: FC = () => {
    return (
        <BaseCard width="18%" background={`white`} textAlign="center" ms={8} p="10px 0px" borderRadius={18}>
            <ChakraFlex width="100%" height="100%" gridGap="sm">
                <ChakraFlex flex="2" flexDirection="column">
                    <ChakraText fontSize="2xl" color="blue.500">
                        XX minutes
                    </ChakraText>
                    <ChakraText fontSize="lg" color="blue.500">
                        Average time to improve at least 50%
                    </ChakraText>
                </ChakraFlex>
            </ChakraFlex>
        </BaseCard >
    );
};
