import React, { FC } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Grid as ChakraGrid,
  Img as ChakraImg,
  Text as ChakraText
} from '@chakra-ui/react';

interface Member {
  name: string;
  role: string;
  image: string;
  description: string;
}

export const ExtrasTeamPanel: FC = () => {
  const getStaticTeamMembers: Member[] = [
    {
      name: 'Bara Sapir',
      role: 'MindFlow Creator',
      image: 'member-bara',
      description: 'Educational entrepreneur'
    },
    {
      name: 'Alam Brown',
      role: 'MindFlow Business',
      image: 'member-adam',
      description: 'Educational entrepreneur'
    },
    {
      name: 'Palio',
      role: 'Software engineer',
      image: 'member-palio',
      description: 'Software engineer'
    },
    {
      name: 'Marcela Rolim',
      role: 'UX Designer - Graphic Designer',
      image: 'member-marcela',
      description: 'Ux designer'
    }
  ];

  return (
    <ChakraGrid
      width="100%"
      gridGap="xl"
      gridTemplateColumns={{
        lg: 'repeat(2, 1fr)',
        xl: 'repeat(4, 1fr)'
      }}
    >
      {getStaticTeamMembers.map((member, idx) => (
        <ChakraFlex padding="md" boxShadow="md" borderRadius="sm" flexDirection="column" key={idx}>
          <ChakraFlex marginBottom="md" minHeight="280px">
            <ChakraImg
              width="100%"
              borderRadius="sm"
              objectFit="cover"
              src={require(`../../../assets/images/team/${member.image}.png`)}
            />
          </ChakraFlex>
          <ChakraFlex alignItems="center" justifyContent="space-between">
            <ChakraText fontWeight="bold" color="gray.600">
              {member.name}
            </ChakraText>
          </ChakraFlex>
          <ChakraFlex marginY="xs">
            <ChakraText fontWeight="bold" color="blue.500">
              {member.role}
            </ChakraText>
          </ChakraFlex>
          <ChakraFlex
            gridGap="md"
            height="100%"
            marginBottom="lg"
            flexDirection="column"
            justifyContent="space-between"
          >
            <ChakraText color="gray.600" textAlign="justify">
              {member.description}
            </ChakraText>
          </ChakraFlex>
          <ChakraFlex justifyContent="flex-end">
            <ChakraButton paddingX="xl" colorScheme="blue" boxShadow="lg" borderRadius="sm">
              Link
            </ChakraButton>
          </ChakraFlex>
        </ChakraFlex>
      ))}
    </ChakraGrid>
  );
};
