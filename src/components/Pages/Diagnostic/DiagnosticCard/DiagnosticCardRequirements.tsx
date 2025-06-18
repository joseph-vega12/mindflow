import React, { FC } from 'react';

import { Box, BoxProps, Flex, Progress, Text } from '@chakra-ui/react';
import { compact, isNumber, flatten } from 'lodash';

import { DiagnosticRequirements, IconName } from 'types';
import { useTestResultList } from 'lib/firebase';

import { Icon } from 'components/common';

interface Props extends BoxProps {
  requirements: DiagnosticRequirements;
}

export const DiagnosticCardRequirements: FC<Props> = ({ requirements, ...rest }) => {
  const speedTestResults = useTestResultList(['speed-read']);
  const practiceResults = useTestResultList(['practice']);
  const brainEyeResults = useTestResultList(['brain-eye-coordination']);

  const requirementsLenght = compact(flatten(Object.values(requirements))).length;

  if (!requirementsLenght) {
    return null;
  }

  return (
    <Box {...rest}>
      <Box px="md" py="lg" borderBottom="sm" borderColor="gray.500">
        <Text color="gray.400" fontSize="sm">
          Complete the tasks below to unlock this diagnostic test
        </Text>
      </Box>

      <Box>
        {isNumber(requirements.practice) && requirements.practice > 0 && (
          <Requirement
            label={`Complete ${requirements.practice} practice activities`}
            value={practiceResults.length}
            requirementNumber={requirements.practice}
            icon="book"
          />
        )}

        {isNumber(requirements['speed-read']) && requirements['speed-read'] > 0 && (
          <Requirement
            label={`Complete ${requirements['speed-read']} speed read activities`}
            value={speedTestResults.length}
            requirementNumber={requirements['speed-read']}
            icon="speed-read"
          />
        )}
      </Box>
    </Box>
  );
};

interface RequirementProps extends BoxProps {
  label: string;
  icon: IconName;
  value: number;
  requirementNumber: number;
}

export const Requirement: FC<RequirementProps> = ({ label, icon, value, requirementNumber, ...rest }) => {
  const requirementSatisfied = value >= requirementNumber;

  return (
    <Box fontSize="sm" p="md" borderBottom="sm" borderColor="gray.500" {...rest}>
      <Text mb="sm" fontSize="sm">
        {label}
      </Text>

      <Flex justifyContent="space-evenly">
        <Icon name={icon} color={requirementSatisfied ? 'green.700' : 'teal.700'} />

        <Flex alignItems="center" width="90%" ml="md">
          <Progress
            width="90%"
            size="sm"
            value={value}
            max={requirementNumber}
            borderRadius="md"
            colorScheme={requirementSatisfied ? 'green' : 'teal'}
          />
          {requirementSatisfied ? (
            <Icon name="check-circle" color="green.500" size="sm" mx="md" />
          ) : (
            <Text width="20%" pl={2} fontSize="xs" fontWeight="light" m={0}>
              {value}/{requirementNumber}
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};
