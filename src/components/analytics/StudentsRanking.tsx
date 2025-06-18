import React, { FC } from 'react';

import {
  Avatar as ChakraAvatar,
  AvatarBadge as ChakraAvatarBadge,
  Flex as ChakraFlex,
  Tag as ChakraTag,
  Text as ChakraText
} from '@chakra-ui/react';

import { UserDetails } from 'types';

export interface Rank {
  user: UserDetails;
  value: Number;
}

interface SpeedReadingRankingProps {
  ranking: Rank[];
}

export const StudentsRanking: FC<SpeedReadingRankingProps> = ({ ranking }) => {
  return (
    <ChakraFlex width="100%" height="100%" flexDirection="column" overflow="auto" paddingX="md">
      {ranking.map(({ user, value }, idx) => (
        <ChakraFlex
          width="100%"
          alignItems="center"
          paddingY="md"
          borderBottom="sm"
          borderBottomColor="#FCE2D1"
          key={idx}
          _last={{
            borderBottom: 'none'
          }}
        >
          <ChakraFlex width="100%" alignItems="center" justifyContent="space-between">
            <ChakraFlex width="100%" gridGap="md" alignItems="center">
              <ChakraAvatar size="sm" src={user?.picture ?? undefined}>
                <ChakraAvatarBadge bottom="25px" boxSize="0.8rem" bg="green.500" />
              </ChakraAvatar>
              <ChakraText color="gray.500">
                {user?.firstName}
                <ChakraText as="span" color="orange.500" paddingLeft="sm">
                  Lvl.{user?.level ?? 1}
                </ChakraText>
              </ChakraText>
            </ChakraFlex>
            <ChakraTag
              minWidth="none"
              height="fit-content"
              paddingX="sm"
              borderRadius="xs"
              background="orange.500"
              color="white"
            >
              {value}
            </ChakraTag>
          </ChakraFlex>
        </ChakraFlex>
      ))}
    </ChakraFlex>
  );
};
