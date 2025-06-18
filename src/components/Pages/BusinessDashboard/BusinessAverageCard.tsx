import React, { FC } from 'react';

import { Flex as ChakraFlex, FlexProps as ChakraFlexProps, Text as ChakraText } from '@chakra-ui/react';

import { Property } from 'csstype';

import { IconName } from 'types';

import { BaseCard, Icon } from 'components/common';

interface BusinessAverageCardProps extends ChakraFlexProps {
    value: string | number;
    description: string;
    bgColor: 'white' | 'orange' | 'red' | 'blue' | 'teal' | 'gray';
    color: 'red' | 'blue';
    icon?: IconName;
    columnDirection: Property.FlexDirection;
}
export const BusinessAverageCard: FC<BusinessAverageCardProps> = ({
    value,
    description,
    bgColor,
    color,
    icon,
    columnDirection,
    ...rest
}) => {
    return (
        <BaseCard width="100%" background={`${bgColor}`} {...rest}>
            <ChakraFlex width="100%" height="100%" gridGap="sm" justifyContent="space-between">
                {!icon ? (
                    <ChakraFlex direction={columnDirection} textAlign="center">
                        <ChakraText fontSize="3xl" fontWeight="bold" color={`${color}.500`}>
                            {value}
                        </ChakraText>
                        <ChakraText fontSize="lg" fontWeight="normal" color={`${color}.500`}>
                            {description}
                        </ChakraText>
                    </ChakraFlex>
                ) : (
                    <>
                        <ChakraFlex justifyContent="flex-end">
                            <Icon color="white" size="5rem" name={icon} />
                        </ChakraFlex>
                        <ChakraFlex direction={columnDirection} justifyContent="space-around" alignItems="center">
                            <ChakraText fontSize="4xl" fontWeight="bold" color={`${color}.500`}>
                                {value}
                            </ChakraText>
                            <ChakraText fontSize="lg" fontWeight="normal" color={`${color}.500`} width="50%">
                                {description}
                            </ChakraText>
                        </ChakraFlex>
                    </>
                )}
            </ChakraFlex>
        </BaseCard >
    );
};
