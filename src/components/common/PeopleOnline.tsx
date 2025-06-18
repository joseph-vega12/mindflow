import React, { FC } from 'react';

import {
  Avatar as ChakraAvatar,
  AvatarBadge as ChakraAvatarBadge,
  Tooltip as ChakraTooltip,
  Box as ChakraBox
} from '@chakra-ui/react';
interface Props {
  isLoading: boolean;
}

export const PeopleOnline: FC<Props> = ({ isLoading }) => {
  const userList = [
    {
      id: 1,
      name: 'Test 1 username',
      picture:
        'https://plus.unsplash.com/premium_photo-1683121366070-5ceb7e007a97?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      id: 2,
      name: 'Test 2 username',
      picture:
        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    {
      id: 3,
      name: 'Test 3 username'
    },
    {
      id: 4,
      name: 'Test 4 username'
    },
    {
      id: 5,
      name: 'Test 5 username'
    },
    {
      id: 6,
      name: 'Test 6 username'
    },
    {
      id: 7,
      name: 'Test 7 username'
    }
  ];
  return (
    <>
      {userList.map((user, index) => (
        <ChakraBox key={index} display="inline-block" margin="0 10px">
          <ChakraTooltip label={user.name}>
            <ChakraAvatar
              key={index}
              width="30px"
              height="30px"
              src={user?.picture ?? undefined}
              _hover={{ cursor: 'pointer' }}
            >
              <ChakraAvatarBadge bottom="21px" left="17px" boxSize="1rem" bg="green.500" />
            </ChakraAvatar>
          </ChakraTooltip>
        </ChakraBox>
      ))}
      <ChakraBox display="inline-block" margin="3px 10px 0 10px" fontWeight="bold" whiteSpace="nowrap">
        {' '}
        + 27 people online
      </ChakraBox>
    </>
  );
};
