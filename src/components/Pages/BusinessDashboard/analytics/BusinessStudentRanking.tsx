import React, { FC, useMemo } from 'react';

import {
    Avatar as ChakraAvatar,
    AvatarBadge as ChakraAvatarBadge,
    Flex as ChakraFlex,
    GridItem as ChakraGridItem,
    Heading as ChakraHeading,
    Tag as ChakraTag,
    Text as ChakraText
} from '@chakra-ui/react';
import { Column } from 'react-table';

import { BaseCard, Table } from 'components/common';
import { capitalize } from 'lodash';
import { formatTimestamp } from 'lib/utils';
import { UserDetails } from 'types';

interface BusinessStudentRankingProps {
    title: string;
    data: Record<string, any>[];
}

export const BusinessStudentRanking: FC<BusinessStudentRankingProps> = ({ title, data }) => {
    const getTableColumns: Column[] = useMemo(
        () => [
            {
                width: '25%',
                Header: 'Student',
                accessor: (row: any) => (

                    <ChakraFlex gridGap="md" alignItems="center">
                        <ChakraAvatar size="sm">
                            <ChakraAvatarBadge bottom="25px" boxSize="0.8rem" bg="green.500" />
                        </ChakraAvatar>
                        <ChakraText color="gray.600">
                            {row?.firstName} {row?.lastName}
                            <ChakraText fontWeight="bold" color="orange.500" as="span" ml="sm">
                                Lvl. {row?.level ?? 1}
                            </ChakraText>
                            <ChakraText color="gray.600" as="span" ml="sm">
                                - {capitalize(row.type?.replace(/[-|_]/gi, ' '))}
                            </ChakraText>
                        </ChakraText>
                    </ChakraFlex>
                )
            },
            {
                width: '25%',
                Header: 'Tab',
                accessor: (row: any) => (
                    <ChakraFlex>
                        <ChakraTag size="md" variant="solid" colorScheme="orange" pl={6} pe={6} borderRadius={3}>
                            {row?.rank.toFixed()}
                        </ChakraTag>
                    </ChakraFlex>
                )
            }
        ],
        [data]
    );

    return (
        <BaseCard title={title} borderRadius={18}>
            <Table isPageable={false} hasHeading={false} columns={getTableColumns} data={data} />
        </BaseCard>
    );
};
