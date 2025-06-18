import { Box, Button, Flex, Grid, Heading, Stack } from '@chakra-ui/react';
import React, { FC } from 'react';

import { SpeedReadTestConfig } from './index';

import { EssayOrCustomEssayDocumentWithId } from 'types';
import { HtmlRender } from 'components/common/HtmlRender';

interface Props {
  onFinishTest: () => void;
  essay?: EssayOrCustomEssayDocumentWithId;
  testConfig: SpeedReadTestConfig;
}

export const SpeedReadTest: FC<Props> = ({ onFinishTest, essay, testConfig }) => {
  return (
    <Grid templateColumns={{ lg: '1fr 2fr 8fr 1fr', md: '1fr 2fr 8fr' }} alignItems="center">
      <Box display={{ lg: 'unset', md: 'none' }}></Box>
      <Stack justifyContent="center" px={{ lg: 'md', md: 'none' }} paddingRight={{ md: 'lg', lg: 'none' }}>
        <Button size="sm" colorScheme="green" onClick={onFinishTest}>
          Finished
        </Button>
      </Stack>
      <Box gridColumn={{ md: '2/4' }} my={4}>
        <Heading textStyle="title-with-border-bottom" fontSize="md" px={2} mb={3}>
          {essay?.name}
        </Heading>
        <Box overflow="auto" maxHeight="65vh">
          <HtmlRender
            html={`
              <style>
                .htmlRender {
                  text-indent: 25px;
                  font-family: ${testConfig.fontFamily};
                  font-size: ${testConfig.fontSize}px;
                }
              </style>
              <div class='htmlRender'>
                ${essay?.textHtml}
              </div>
            `}
          />

          <Flex justifyContent="center" mt={5}>
            <Button size="sm" colorScheme="green" onClick={onFinishTest} mr={4}>
              Finished
            </Button>
          </Flex>
        </Box>
      </Box>
    </Grid>
  );
};
