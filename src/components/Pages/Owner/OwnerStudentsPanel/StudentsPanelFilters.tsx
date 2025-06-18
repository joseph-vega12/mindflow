import React, { FC, useState } from 'react';

import {
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputLeftAddon as ChakraInputLeftAddon,
  InputRightElement as ChakraInputRightElement,
  Text as ChakraText,
  Button as ChakraButton,
  Select as ChakraSelect,
  useDisclosure
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { testTypeOptions, UserDetails, UserDetailsWithId, whereDidYouHearAboutUsOptions } from 'types';

import { Icon } from 'components/common';
interface Props {
  students: UserDetailsWithId[];
}

export const StudentsPanelFilters: FC<Props> = ({ students }) => {
  const form = useFormContext();
  const filterDifficultLevels = ['adult', 'college', 'high_school', 'middle_school'];

  return (
    <>
      <ChakraFlex
        width="100%"
        marginBottom="lg"
        justifyContent="space-between"
        flexDirection={{ md: 'column', lg: 'row' }}
      >
        <ChakraFlex width="100%" alignItems="center">
          <ChakraHeading fontSize="md" marginRight="md" whiteSpace="nowrap" textStyle="title-with-border-bottom">
            Data Display Filters
          </ChakraHeading>
        </ChakraFlex>
        <ChakraFlex width="100%" alignItems="center" justifyContent={{ lg: 'flex-end', md: 'space-between' }}>
          <ChakraFlex alignItems="center">
            <ChakraText color="blue.500" marginRight="sm" fontSize="5xl">
              {students?.length ?? '-'}
            </ChakraText>
            <ChakraFlex color="gray.600" flexDirection="column">
              <ChakraText fontSize="md">Total</ChakraText>
              <ChakraText fontSize="md">Students</ChakraText>
            </ChakraFlex>
          </ChakraFlex>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraFlex width="100%" gridColumnGap="md" flexDirection={{ md: 'column', lg: 'row' }}>
        <ChakraInputGroup marginBottom="md">
          <ChakraInput name="searchStudents" placeholder="Search Students" borderRadius="sm" {...form.register('searchStudents', { required: true })} />
          <ChakraInputRightElement>
            <Icon size="sm" borderColor="gray.500" name="search" />
          </ChakraInputRightElement>
        </ChakraInputGroup>
        <ChakraInputGroup marginBottom="md">
          <ChakraInputLeftAddon
            width="100px"
            color="white"
            fontWeight="normal"
            background="gray.500"
            borderLeftRadius="sm"
          >
            Level
          </ChakraInputLeftAddon>
          <ChakraSelect borderLeftRadius="none" borderRightRadius="sm" name="difficultLevel"  {...form.register('difficultLevel', { required: true })}>
            <option value="">No Filter</option>
            {filterDifficultLevels.map((value, idx) => (
              <option value={value} key={idx}>
                {value}
              </option>
            ))}
          </ChakraSelect>
        </ChakraInputGroup>
        <ChakraInputGroup marginBottom="md">
          <ChakraInputLeftAddon
            width="100px"
            color="white"
            fontWeight="normal"
            background="gray.500"
            borderLeftRadius="sm"
          >
            Test
          </ChakraInputLeftAddon>
          <ChakraSelect borderLeftRadius="none" borderRightRadius="sm" name="testType" {...form.register('testType', { required: true })}>
            <option value="">No Filter</option>
            {Object.entries(testTypeOptions).map(([key, value]) => (
              <option value={key} key={key}>
                {value}
              </option>
            ))}
          </ChakraSelect>
        </ChakraInputGroup>
        <ChakraInputGroup marginBottom="md">
          <ChakraInputLeftAddon
            width="100px"
            color="white"
            fontWeight="normal"
            background="gray.500"
            borderLeftRadius="sm"
          >
            From
          </ChakraInputLeftAddon>
          <ChakraSelect
            name="whereDidYouHearAboutUs"
            borderLeftRadius="none"
            borderRightRadius="sm"
            {...form.register('whereDidYouHearAboutUs', { required: true })}
          >
            <option value="">No Filter</option>
            {Object.entries(whereDidYouHearAboutUsOptions).map(([key, value]) => (
              <option value={key} key={key}>
                {value}
              </option>
            ))}
          </ChakraSelect>
        </ChakraInputGroup>
      </ChakraFlex>
    </>
  );
};
