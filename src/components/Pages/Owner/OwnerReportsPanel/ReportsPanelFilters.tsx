import React, { FC, useEffect, useState } from 'react';

import {
  Box as ChakraBox,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement
} from '@chakra-ui/react';

import { Select } from '@chakra-ui/react';
import { RangeDatepicker } from 'chakra-dayzed-datepicker';
import moment from 'moment';

import { Controller, useForm, useFormContext } from 'react-hook-form';
import { Icon } from 'components/common';
import { useQuery } from 'react-query';

import { Business, BusinessDocumentWithId, testTypeOptions } from 'types';
import { toast } from 'react-toastify';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';


export const ReportsPanelFilters: FC<any> = ({ selectedDates, setSelectedDates }) => {
  const { register, control, getValues } = useFormContext();

  const testOptions = Object.entries(testTypeOptions).map(([value, label]) => {
    return {
      value: value,
      label: label
    };
  });

  const businessQuery = useQuery(
    ['businesses'],
    async () => {
      const businessSnap =
        collection(db, 'business')
          .withConverter<BusinessDocumentWithId>({
            fromFirestore: (doc) => {
              return {
                id: doc.id,
                ...(doc.data() as Business)
              };
            },
            toFirestore: (doc: Business) => doc
          })

      const businessesDocs = await getDocs(businessSnap)
      const businesses = businessesDocs.docs.map((doc) => doc.data());
      return businesses;
    },
    {
      refetchOnMount: false,
      onError: (err: Error) => {
        toast.error(err?.message);
      }
    }
  );
  const clientOptions = businessQuery.data?.map((business) => {
    return {
      value: business.id,
      label: business.name
    };
  });

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
        Client
        <Controller
          name="selectedClients"
          control={control}
          render={({ field: { onChange, onBlur, value, name, ref } }) => (
            <Select
              name={name}
              ref={ref}
              onBlur={onBlur}
              isMulti
              components={removeSelectButton}
              options={clientOptions}
              placeholder="Select Clients"
              closeMenuOnSelect={false}
              onChange={onChange}
              value={value}
              tagVariant="solid"
            />
          )}
        />
      </ChakraBox>
      <ChakraBox marginBottom="md">
        Tests
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
      <ChakraBox marginBottom="md" width="100%">
        Date of license activation
        <Controller
          name="selectedDates"
          control={control}
          render={({ field: { onChange, onBlur, value, name } }) => (
            <RangeDatepicker name={name} selectedDates={selectedDates} onDateChange={setSelectedDates} />
          )}
        />
      </ChakraBox>
    </ChakraFlex>
  );
};
