import React, { FC, useState } from 'react';

import { Icon } from 'components/common';

import {
  Box as ChakraBox,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputLeftAddon as ChakraInputLeftAddon,
  InputRightElement as ChakraInputRightElement
} from '@chakra-ui/react';

// import { OptionBase, Select } from 'chakra-react-select';
import { Select } from '@chakra-ui/react';
import { Controller, useForm, useFormContext } from 'react-hook-form';
import { testTypeOptions, DifficultLevel } from 'types';
import { toast } from 'react-toastify';
import { RangeDatepicker } from 'chakra-dayzed-datepicker';

import { useQuery } from 'react-query';

interface Props {
  disableStudentSearch?: boolean;
}

export const LicensePanelFilters: FC<any> = ({ selectedDates, setSelectedDates }) => {
  const { register, control, getValues } = useFormContext();

  const testOptions = Object.entries(testTypeOptions).map(([value, label]) => {
    return {
      value: value,
      label: label
    };
  });

  const filterDifficultLevels = [
    { value: 'adult', label: 'ADULT' },
    { value: 'college', label: 'COLLEGE' },
    { value: 'high_school', label: 'HIGH SCHOOL' },
    { value: 'middle_school', label: 'MIDDLE SCHOOL' }
  ];

  const removeSelectButton = { DropdownIndicator: null, IndicatorSeparator: null, clearIndicator: null };

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
        <ChakraInput name="searchStudents" placeholder="Search Students" {...register("searchStudents")} />
        <ChakraInputRightElement>
          <Icon size="sm" borderColor="gray.500" name="search" />
        </ChakraInputRightElement>
      </ChakraInputGroup>
      <ChakraBox marginBottom="md">
        Level
        <Controller
          name="selectedLevels"
          control={control}
          render={({ field: { onChange, onBlur, value, name, ref } }) => (
            <Select
              name={name}
              ref={ref}
              onBlur={onBlur}
              isMulti
              components={removeSelectButton}
              options={filterDifficultLevels}
              placeholder="Select Level"
              closeMenuOnSelect={false}
              onChange={onChange}
              value={value}
              tagVariant="solid"
            />
          )}
        />
      </ChakraBox>
      <ChakraBox marginBottom="md">
        Test
        <Controller
          name="selectedTests"
          control={control}
          render={({ field: { onChange, onBlur, value, name, ref } }) => (
            <Select
              name={name}
              ref={ref}
              onBlur={onBlur}
              isMulti
              components={removeSelectButton}
              options={testOptions}
              placeholder="Select Tests"
              closeMenuOnSelect={false}
              onChange={onChange}
              value={value}
              tagVariant="solid"
            />
          )}
        />
      </ChakraBox>
      <ChakraBox marginBottom="md">
        <ChakraBox marginBottom="md" width="100%">
          Date of license activation
          <Controller
            name="selectedDates"
            control={control}
            render={({ field: { name } }) => (
              <RangeDatepicker name={name} selectedDates={selectedDates} onDateChange={setSelectedDates} />
            )}
          />
        </ChakraBox>
      </ChakraBox>
    </ChakraFlex>
  );
};
