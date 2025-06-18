import React, { FC } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Grid as ChakraGrid,
  Img as ChakraImg,
  Tag as ChakraTag,
  Text as ChakraText
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export const ExtrasAddonsPanel: FC = () => {
  const push = useNavigate();

  const getStaticAddons = [
    {
      id: 1,
      title: 'Mindprint Extra Classes',
      category: 'Software',
      description: 'Missing description',
      price: 15,
      image: 'addon-mindprint.png',
      images: [
        'addons/addon-mindprint.png',
        'addons/addon-expert.png',
        'addons/addon-mindprint.png',
        'addons/addon-google-agenda.png',
        'addons/addon-nepal.png'
      ]
    },
    {
      id: 2,
      title: 'Expert Audio Classes',
      category: 'Extra Content',
      description: 'Missing description',
      price: 15,
      image: 'addon-expert.png',
      images: [
        'addons/addon-mindprint.png',
        'addons/addon-expert.png',
        'addons/addon-mindprint.png',
        'addons/addon-google-agenda.png',
        'addons/addon-nepal.png'
      ]
    },
    {
      id: 3,
      title: 'Google Agenda',
      category: 'Integration',
      description: 'Missing description',
      price: 0,
      image: 'addon-google-agenda.png',
      images: [
        'addons/addon-mindprint.png',
        'addons/addon-expert.png',
        'addons/addon-mindprint.png',
        'addons/addon-google-agenda.png',
        'addons/addon-nepal.png'
      ]
    },
    {
      id: 4,
      title: 'Nepal Meditation',
      category: 'Extra Content',
      description: 'Missing description',
      price: 15,
      image: 'addon-nepal.png',
      images: [
        'addons/addon-mindprint.png',
        'addons/addon-expert.png',
        'addons/addon-mindprint.png',
        'addons/addon-google-agenda.png',
        'addons/addon-nepal.png'
      ]
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
      {getStaticAddons.map((addon, idx) => (
        <ChakraFlex padding="md" boxShadow="md" borderRadius="sm" flexDirection="column" key={idx}>
          <ChakraFlex marginBottom="md" minHeight="163px">
            <ChakraImg
              width="100%"
              objectFit="cover"
              borderRadius="sm"
              src={require(`assets/images/addons/${addon.image}`)}
            />
          </ChakraFlex>
          <ChakraFlex alignItems="center" justifyContent="space-between">
            <ChakraText fontWeight="bold" color="gray.600">
              {addon.title}
            </ChakraText>
            {addon.price ? (
              <ChakraTag paddingX="md" color="white" background="blue.500">
                {`$${addon.price}`}
              </ChakraTag>
            ) : (
              <></>
            )}
          </ChakraFlex>
          <ChakraFlex marginY="sm">
            <ChakraText fontWeight="bold" color="blue.500">
              Category:{' '}
              <ChakraText fontWeight="normal" as="span">
                {addon.category}
              </ChakraText>
            </ChakraText>
          </ChakraFlex>
          <ChakraText marginBottom="lg" color="gray.600" textAlign="justify">
            {addon.description}
          </ChakraText>
          <ChakraFlex justifyContent="flex-end">
            <ChakraButton
              boxShadow="lg"
              borderRadius="sm"
              colorScheme={addon.price ? 'blue' : 'green'}
              onClick={() => push(`/addon/${addon.id}/details`)}
            >
              {addon.price ? 'Buy Now' : 'Access Content'}
            </ChakraButton>
          </ChakraFlex>
        </ChakraFlex>
      ))}
    </ChakraGrid>
  );
};
