import React, { FC } from 'react';

import {
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Tab as ChakraTab,
  TabList as ChakraTabList,
  TabPanel as ChakraTabPanel,
  TabPanels as ChakraTabPanels,
  Tabs as ChakraTabs
} from '@chakra-ui/react';

import { BasePage } from 'components/layout/Pages';
import { ExtrasAddonsPanel, ExtrasTeamPanel } from 'components/Pages/Extras';

export const ExtrasPage: FC = () => {
  return (
    <BasePage spacing="md">
      <ChakraTabs variant="enclosed">
        <ChakraTabList borderColor="gray.300" justifyContent="flex-end">
          <ChakraFlex flex="1">
            <ChakraHeading as="h2" fontSize="2xl" fontWeight="600" color="blue.500">
              Extras
            </ChakraHeading>
          </ChakraFlex>
          <ChakraTab whiteSpace="nowrap" borderTopRadius="sm" paddingX="xxl">
            ADD ONS
          </ChakraTab>
          <ChakraTab whiteSpace="nowrap" borderTopRadius="sm" paddingX="xxl">
            MINDFLOW TEAM
          </ChakraTab>
        </ChakraTabList>
        <ChakraTabPanels>
          <ChakraTabPanel paddingY="xl" paddingX="unset">
            <ExtrasAddonsPanel />
          </ChakraTabPanel>
          <ChakraTabPanel paddingY="xl" paddingX="unset">
            <ExtrasTeamPanel />
          </ChakraTabPanel>
        </ChakraTabPanels>
      </ChakraTabs>
    </BasePage>
  );
};
