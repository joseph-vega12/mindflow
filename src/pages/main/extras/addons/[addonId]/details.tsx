import React, { FC } from 'react';

import { useRouteMatch } from 'react-router-dom';

import { AddonDetails } from 'components/Pages/Addon';
import { BasePage, BasePageTitle } from 'components/layout/Pages';

export const AddonDetailsPage: FC = () => {
  const { params } = useRouteMatch<{ addonId: string }>();

  const getStaticAddons = [
    {
      id: 1,
      title: 'Mindprint Extra Classes',
      category: 'Software',
      description: 'Description aaaa aaaa aaaa aaaa aaaa aaaa aaaa',
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
      description: 'Description aaaa aaaa aaaa aaaa aaaa aaaa aaaa',
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
      description: 'Description aaaa aaaa aaaa aaaa aaaa aaaa aaaa',
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
      description: 'Description aaaa aaaa aaaa aaaa aaaa aaaa aaaa',
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

  const getCurrentAddon = getStaticAddons.find(({ id }) => Number(params.addonId) === id);

  return (
    <BasePage spacing="md">
      <BasePageTitle showGoBack title={`Add-ons - ${getCurrentAddon?.title}`} paddingBottom="md" />
      {getCurrentAddon && (
        <AddonDetails
          title={getCurrentAddon?.title}
          category={getCurrentAddon?.category}
          description={getCurrentAddon?.description}
          price={getCurrentAddon?.price}
          image={getCurrentAddon?.image}
          images={getCurrentAddon?.images}
        // onAction={() => console.log('action!')}
        />
      )}
    </BasePage>
  );
};
