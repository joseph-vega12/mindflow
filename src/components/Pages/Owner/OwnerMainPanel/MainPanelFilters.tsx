import React, { FC } from 'react';

import {
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputLeftAddon as ChakraInputLeftAddon,
  InputRightElement as ChakraInputRightElement,
  Select as ChakraSelect
} from '@chakra-ui/react';

import { useFormContext } from 'react-hook-form';

interface Props {
  disableStudentSearch?: boolean;
}

export const MainPanelFilters: FC<Props> = ({ disableStudentSearch }) => {
  const form = useFormContext();

  const values = form.watch();

  const testTypeOptions = ['isee', 'shsat', 'ssat', 'sat', 'act', 'lsat', 'gre', 'gmat'];
  const filterDifficultLevels = ['adult', 'college', 'high_school', 'middle_school'];

  return (
    <ChakraFlex flexDirection="column">
      <ChakraHeading
        fontSize="md"
        marginRight="md"
        marginBottom="md"
        whiteSpace="nowrap"
        textStyle="title-with-border-bottom"
      >
        Data Display Filters
      </ChakraHeading>
      <ChakraInputGroup marginBottom="md">
        <ChakraInputLeftAddon
          width="112px"
          color="white"
          fontWeight="normal"
          background="gray.500"
          borderLeftRadius="sm"
        >
          Level
        </ChakraInputLeftAddon>
        <ChakraSelect
          borderLeftRadius="none"
          borderRightRadius="sm"
          name="difficultLevel"
          value={values.difficultLevel}
          onChange={(ev) => form.setValue('difficultLevel', ev.target.value)}
        >
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
          width="112px"
          color="white"
          fontWeight="normal"
          background="gray.500"
          borderLeftRadius="sm"
        >
          Test
        </ChakraInputLeftAddon>
        <ChakraSelect
          borderLeftRadius="none"
          borderRightRadius="sm"
          name="testType"
          value={values.testType}
          onChange={(ev) => form.setValue('testType', ev.target.value)}
        >
          <option value="">No Filter</option>
          {testTypeOptions.map((value, idx) => (
            <option value={value} key={idx}>
              {value}
            </option>
          ))}
        </ChakraSelect>
      </ChakraInputGroup>
      <ChakraInputGroup marginBottom="md">
        <ChakraInputLeftAddon
          width="120px"
          color="white"
          fontWeight="normal"
          background="blue.500"
          borderLeftRadius="sm"
        >
          Date
        </ChakraInputLeftAddon>
        <ChakraFlex width="100%" minWidth="0px">
          <ChakraInput type="date" placeholder="DD/MM/YYYY" borderRadius="none" name="startDate" {...form.register('startDate', { required: true })} />
          <ChakraInput
            type="date"
            placeholder="DD/MM/YYYY"
            borderLeftRadius="none"
            borderRadius="sm"
            name="endDate"
            {...form.register('endDate', { required: true })}
          />
        </ChakraFlex>
      </ChakraInputGroup>
    </ChakraFlex>
  );
};
