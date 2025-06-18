import React, { FC, useMemo, useState } from 'react';

import {
  chakra,
  Button as ChakraButton,
  Flex as ChakraFlex,
  FormControl as ChakraFormControl,
  FormLabel as ChakraFormLabel,
  Grid as ChakraGrid,
  Heading as ChakraHeading,
  Img as ChakraImg,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement,
  Modal as ChakraModal,
  ModalBody as ChakraModalBody,
  ModalCloseButton as ChakraModalCloseButton,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalHeader as ChakraModalHeader,
  ModalOverlay as ChakraModalOverlay,
  Radio as ChakraRadio,
  RadioGroup as ChakraRadioGroup,
  Select as ChakraSelect,
  SimpleGrid as ChakraSimpleGrid,
  Stack as ChakraStack,
  Text as ChakraText,
  useDisclosure
} from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useMutation } from 'react-query';
import usaTestPrep from 'assets/images/usa-test-prep.png';
import { useAuthContext } from 'lib/firebase';

import { Icon } from 'components/common';

import { Business } from 'types';
import { BusinessWithUsers } from '.';
import { withMask } from 'use-mask-input';
import { addDoc, collection } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';


interface BTOBPanelCompaniesProps {
  businesses: BusinessWithUsers[];
  onCreateBusiness: () => void;
}

export const BTOBPanelCompanies: FC<BTOBPanelCompaniesProps> = ({ businesses, onCreateBusiness }) => {
  const [searchInput, setSearchInput] = useState('');

  const { user } = useAuthContext();
  const { register, handleSubmit, getValues, control } = useForm<BusinessWithUsers>({
    defaultValues: {}
  });

  const modalDisclosure = useDisclosure();

  const { mutate: licenseMutation, isLoading } = useMutation(async () => {
    const values: BusinessWithUsers = getValues();

    try {
      await addDoc(collection(db, 'business'), {
        ...values,
        onwerId: user?.uid,
        timestamp: +new Date()
      } as Business);

      toast.success('Business created');

      modalDisclosure.onClose();

      onCreateBusiness();
    } catch (error) {
      toast.error('An error has occurred, try  again!');
    }
  });

  const getTotalAffiliatedStudents = useMemo(() => {
    const filteredUsers = [];

    businesses?.forEach((business) => filteredUsers.push(...(business?.users || [])));

    return filteredUsers.length;
  }, [businesses]);

  const getTestTypeOptions = ['isee', 'shsat', 'ssat', 'sat', 'act', 'lsat', 'gre', 'gmat'];
  const getBusinessesBySearch = useMemo(
    () => businesses.filter((business) => business.name.toLowerCase().match(searchInput.toLowerCase())),
    [searchInput, businesses]
  );

  const getProgramLocationOptions = [
    { label: 'Online', value: 'ONLINE' },
    { label: 'In person', value: 'IN_PERSON' },
    { label: 'Both', value: 'BOTH' }
  ];

  const getProgramModalityOptions = [
    { label: 'Group', value: 'GROUP' },
    { label: 'Individual', value: 'INDIVIDUAL' },
    { label: 'Both', value: 'BOTH' }
  ];

  const onSubmit = async () => {
    licenseMutation();
  };

  return (
    <ChakraFlex flexDirection="column">
      <ChakraFlex
        width="100%"
        marginBottom="lg"
        justifyContent="space-between"
        flexDirection={{ md: 'column', lg: 'row' }}
      >
        <ChakraFlex width="100%" alignItems="center">
          <ChakraHeading fontSize="md" marginRight="xl" whiteSpace="nowrap" textStyle="title-with-border-bottom">
            Companies list
          </ChakraHeading>
          <ChakraInputGroup>
            <ChakraInput
              placeholder="Search Company"
              borderRadius="sm"
              value={searchInput}
              onChange={({ target }) => setSearchInput(target.value)}
            />
            <ChakraInputRightElement>
              <Icon size="sm" borderColor="gray.500" name="search" />
            </ChakraInputRightElement>
          </ChakraInputGroup>
        </ChakraFlex>
        <ChakraFlex width="100%" alignItems="center" justifyContent={{ lg: 'flex-end', md: 'space-between' }}>
          <ChakraFlex marginRight="xxl" alignItems="center">
            <ChakraText color="blue.500" marginRight="sm" fontSize="5xl">
              {businesses.length || 0}
            </ChakraText>
            <ChakraFlex color="gray.600" flexDirection="column">
              <ChakraText fontSize="md">Companies</ChakraText>
            </ChakraFlex>
          </ChakraFlex>
          <ChakraFlex marginRight="xxl" alignItems="center">
            <ChakraText color="orange.500" marginRight="sm" fontSize="5xl">
              {getTotalAffiliatedStudents || 0}
            </ChakraText>
            <ChakraFlex color="gray.600" flexDirection="column">
              <ChakraText fontSize="md">Affiliated</ChakraText>
              <ChakraText fontSize="md">Students</ChakraText>
            </ChakraFlex>
          </ChakraFlex>
          <ChakraButton
            borderRadius="sm"
            colorScheme="orange"
            leftIcon={<Icon name="invite" />}
            onClick={() => modalDisclosure.onOpen()}
          >
            Register Company
          </ChakraButton>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraGrid
        gridColumnGap="md"
        gridRowGap="md"
        gridTemplateColumns={{ lg: 'repeat(2, 1fr)', md: 'repeat(1, 1fr)', xl: 'repeat(3, 1fr)' }}
      >
        {getBusinessesBySearch.map((business, idx) => (
          <ChakraFlex padding="md" borderRadius="sm" boxShadow="lg" key={idx}>
            <ChakraFlex width="186px" height="100px" borderRadius="sm" boxShadow="lg" overflow="hidden">
              <ChakraImg width="100%" objectFit="none" src={usaTestPrep} />
            </ChakraFlex>
            <ChakraFlex width="100%" justifyContent="center" flexDirection="column" marginLeft="lg">
              <ChakraText marginBottom="sm" fontSize="lg" color="gray.600" fontWeight="bold">
                {business.name || '-'}
              </ChakraText>
              <ChakraFlex alignItems="center">
                <ChakraText marginRight="xl" color="gray.600" fontSize="4xl">
                  {business.users?.length}/45
                </ChakraText>
                <ChakraText color="gray.600" fontSize="md">
                  licenses
                </ChakraText>
              </ChakraFlex>
            </ChakraFlex>
          </ChakraFlex>
        ))}
      </ChakraGrid>
      <ChakraModal isCentered size="2xl" isOpen={modalDisclosure.isOpen} onClose={() => modalDisclosure.onClose()}>
        <ChakraModalOverlay />
        <chakra.form onSubmit={handleSubmit(onSubmit)}>
          <ChakraModalContent borderRadius="sm">
            <ChakraModalHeader borderBottom="sm" borderBottomColor="gray.300">
              Register company
            </ChakraModalHeader>
            <ChakraModalCloseButton top="12px" />
            <ChakraModalBody paddingY="lg">
              <ChakraFlex flexDirection="column" marginBottom="md">
                <ChakraText fontSize="xl" fontWeight="bold" marginBottom="md">
                  Company informations
                </ChakraText>
                <ChakraSimpleGrid width="100%" columns={3} gap="md">
                  <ChakraFlex flexDirection="column">
                    <ChakraFormLabel>Company name</ChakraFormLabel>
                    <ChakraInput
                      required
                      placeholder="Insert company name"
                      name="name"
                      borderColor="gray.500"
                      disabled={isLoading}
                      {...register("name")}
                    />
                  </ChakraFlex>
                  <ChakraFlex flexDirection="column">
                    <ChakraFormLabel>Company address</ChakraFormLabel>
                    <ChakraInput
                      required
                      type="address"
                      name="address"
                      placeholder="Insert company address"
                      borderColor="gray.500"
                      disabled={isLoading}
                      {...register("address")}
                    />
                  </ChakraFlex>
                  <ChakraFlex flexDirection="column">
                    <ChakraFormLabel>Company phone</ChakraFormLabel>
                    <ChakraInput
                      required
                      name="phone"
                      height="40px"
                      paddingX="md"
                      border="sm"
                      borderRadius="md"
                      borderColor="gray.500"
                      transitionDuration="0.3s"
                      _focus={{
                        outlineColor: 'blue.500'
                      }}
                      disabled={isLoading}
                      ref={withMask("9999999999999")}
                      {...register("phone")}
                      style={{ border: "1px solid #999" }}
                    />
                  </ChakraFlex>
                  <ChakraFlex flexDirection="column">
                    <ChakraFormLabel>Company contact person</ChakraFormLabel>
                    <ChakraInput
                      required
                      name="contactPerson"
                      placeholder="Insert company contact person"
                      borderColor="gray.500"
                      disabled={isLoading}
                      {...register("contactPerson")}
                    />
                  </ChakraFlex>
                  <ChakraFlex flexDirection="column">
                    <ChakraFormLabel>Company email</ChakraFormLabel>
                    <ChakraInput
                      required
                      name="email"
                      type="email"
                      placeholder="Insert company email"
                      borderColor="gray.500"
                      disabled={isLoading}
                      {...register("email")}
                    />
                  </ChakraFlex>
                  <ChakraFlex flexDirection="column">
                    <ChakraFormLabel>Company website</ChakraFormLabel>
                    <ChakraInput
                      required
                      name="website"
                      placeholder="Insert company website"
                      borderColor="gray.500"
                      disabled={isLoading}
                      {...register("website")}
                    />
                  </ChakraFlex>
                  <ChakraFlex flexDirection="column">
                    <ChakraFormLabel>Company test type</ChakraFormLabel>
                    <ChakraSelect
                      required
                      name="testType"
                      placeholder="Insert company test type"
                      borderColor="gray.500"
                      disabled={isLoading}
                      {...register("testType")}
                    >
                      {getTestTypeOptions.map((testType, idx) => (
                        <option value={testType} key={idx}>
                          {testType}
                        </option>
                      ))}
                    </ChakraSelect>
                  </ChakraFlex>
                </ChakraSimpleGrid>
              </ChakraFlex>
              <ChakraFlex flexDirection="column">
                <ChakraText fontSize="xl" fontWeight="bold" marginBottom="md">
                  Program informations
                </ChakraText>
                <ChakraSimpleGrid width="100%" columns={2} gap="md">
                  <ChakraFormControl isRequired>
                    <ChakraFormLabel>Program location</ChakraFormLabel>
                    <Controller
                      name="programLocation"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <ChakraRadioGroup
                          disabled={isLoading}
                          {...register("programLocation")}
                          value={value}
                          onChange={(newValue) => onChange(newValue)}
                        >
                          <ChakraStack direction="row">
                            {getProgramLocationOptions.map((type, idx) => (
                              <ChakraRadio value={type.value} key={idx}>
                                {type.label}
                              </ChakraRadio>
                            ))}
                          </ChakraStack>
                        </ChakraRadioGroup>
                      )}
                    />
                  </ChakraFormControl>
                  <ChakraFormControl isRequired>
                    <ChakraFormLabel>Program modality</ChakraFormLabel>
                    <Controller
                      name="programModality"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <ChakraRadioGroup
                          disabled={isLoading}
                          {...register("programModality")}
                          value={value}
                          onChange={(newValue) => onChange(newValue)}
                        >
                          <ChakraStack direction="row">
                            {getProgramModalityOptions.map((type, idx) => (
                              <ChakraRadio value={type.value} key={idx}>
                                {type.label}
                              </ChakraRadio>
                            ))}
                          </ChakraStack>
                        </ChakraRadioGroup>
                      )}
                    />
                  </ChakraFormControl>
                </ChakraSimpleGrid>
              </ChakraFlex>
            </ChakraModalBody>
            <ChakraModalFooter borderTop="sm" borderTopColor="gray.300" justifyContent="space-between">
              <ChakraText
                cursor="pointer"
                colorScheme="blue"
                marginRight="lg"
                onClick={() => modalDisclosure.onClose()}
              >
                Close
              </ChakraText>
              <ChakraButton borderRadius="sm" colorScheme="blue" type="submit" isLoading={isLoading}>
                Register company
              </ChakraButton>
            </ChakraModalFooter>
          </ChakraModalContent>
        </chakra.form>
      </ChakraModal>
    </ChakraFlex>
  );
};
