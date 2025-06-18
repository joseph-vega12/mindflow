import React, { FC } from 'react';

import { Badge as ChakraBadge, Flex as ChakraFlex, Text as ChakraText } from '@chakra-ui/react';

import { FeedActivityType, FeedActivityWithId } from 'types/firestoreDb/Feed';
import { IconName } from 'types';

import { BaseCard } from 'components/common/BaseCard';
import { Icon } from 'components/common';

import { formatTimestamp } from 'lib/utils';

export interface Props {
  activities: FeedActivityWithId[];
}

export const RecentActivities: FC<Props> = ({ activities }) => {
  const activitiesIcons: Record<FeedActivityType, IconName> = {
    'speed-read': 'speed-read',
    diagnostic: 'book',
    practice: 'playlist-add',
    'brain-eye-coordination': 'playlist-add',
    video: 'play_circle_outline'
  };

  return (
    <BaseCard width="100%" title="Recent Activities" height="100%" overflowY="auto">
      {activities.map((activity) => (
        <ChakraFlex
          key={activity.id}
          width="100%"
          gridGap="sm"
          paddingY="sm"
          borderBottom="sm"
          borderColor="orange.400"
          justifyContent="space-between"
          _last={{
            borderBottom: 'none'
          }}
        >
          <ChakraFlex alignItems="center">
            <Icon name={activitiesIcons[activity.type]} color="orange.400" fontSize="md" mr={3} />
            <ChakraText isTruncated width="100%" fontSize="sm" fontWeight="400">
              Completed {activity.type?.replace(/[-|_]/gi, ' ')}
            </ChakraText>
          </ChakraFlex>
          <ChakraBadge variant="solid" colorScheme="orange" display="flex" alignItems="center">
            {formatTimestamp(activity.timestamp, 'MM/DD/YYYY')}
          </ChakraBadge>
        </ChakraFlex>
      ))}
    </BaseCard>
  );
};
