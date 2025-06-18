import React, { FC, useMemo, useState } from 'react';
import { isNil } from 'lodash';
import {
  Flex as ChakraFlex,
  FormControl as ChakraFormControl,
  FormLabel as ChakraFormLabel,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputLeftAddon as ChakraInputLeftAddon,
  InputRightElement as ChakraInputRightElement,
  Select as ChakraSelect,
  Button as ChakraButton,
  useDisclosure
} from '@chakra-ui/react';

import { Select } from '@chakra-ui/react';
import { Icon, Modal } from 'components/common';
import { get } from 'lodash';
import { Controller, useFormContext } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { BaseCard } from 'components/common';
import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { StudentsPanelFilters, StudentsPanelListing } from 'components/Pages/Owner/OwnerStudentsPanel';

import { Business, BusinessDocumentWithId, ELicenseStatus, UserDetails, UserDetailsWithId } from 'types';
import { LicensesUnderBusinessPanel } from 'components/Pages/Owner/OwnerBusinessLicensePanel';
import axios from 'axios';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const BusinessDetails: FC = () => {
  const [searchInput, setSearchInput] = useState('');

  const { business } = useParams<{ business: string }>();

  const [studentsOptions, setStudentsOptions] = useState<{ value: string; label: string }[]>([]);
  const form = useFormContext();

  const values = form.watch();

  const modalAssignStudentBusiness = useDisclosure();
  const licenseStatusOptions = [ELicenseStatus.ACTIVE, ELicenseStatus.EXPIRED, ELicenseStatus.INACTIVE];

  const businessQuery = useQuery(
    ['owner', 'businesses', business],
    async () => {

      const businessRef = collection(db, 'business')

      const businessSnap = query(businessRef.withConverter<BusinessDocumentWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as Business)
          };
        },
        toFirestore: (doc: BusinessDocumentWithId) => doc
      }))

      const businessDocs = await getDocs(businessSnap)
      const business = businessDocs.docs.map((d) => d.data());
      return business;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: true
    }
  );
  const studentsUnderBusinessQuery = useQuery(
    ['owner', 'Students Under Business', values.difficultLevel, values.testType, values.whereDidYouHearAboutUs],
    async () => {
      const { difficultLevel, testType, whereDidYouHearAboutUs } = values;

      if (difficultLevel || testType || whereDidYouHearAboutUs) {
        const queryKey = difficultLevel ? 'difficultLevel' : testType ? 'testType' : 'whereDidYouHearAboutUs';
        const queryValue = difficultLevel || testType || whereDidYouHearAboutUs;

        const usersRef = await collection(db, `users`)
        const usersSnap = query(usersRef.withConverter<UserDetailsWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as UserDetails)
            };
          },
          toFirestore: (doc: UserDetailsWithId) => doc
        }), where('businessId', '==', business), where(queryKey, "==", queryValue))


        const studentsDocs = await getDocs(usersSnap)
        const students = studentsDocs.docs.map((d) => d.data());
        return students;
      }

      const usersRef = await collection(db, 'users')
      const usersSnap = await query(usersRef.withConverter<UserDetailsWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as UserDetails)
          };
        },
        toFirestore: (doc: UserDetailsWithId) => doc
      }), where('businessId', '==', business), orderBy('firstName'))

      const userDocs = await getDocs(usersSnap)
      const students = userDocs.docs.map((d) => d.data());
      return students;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  const licensesUnderBusinessQuery = useQuery(
    ['owner', 'Licenses Under Business', values.status],
    async () => {
      if (values.status) {
        const licenseRef = await collection(db, 'licenses')

        const licenseSnap = query(licenseRef,
          where('status', '==', values.status),
          where('businessId', '==', business)
        )

        const licenseDoc = await getDocs(licenseSnap)
        const license = licenseDoc.docs.map((doc) => doc.data());
        return license
      }
      const license = await getDocs(query(collection(db, 'licenses'), where('businessId', '==', business)))

      return license.docs.map((doc) => doc.data());
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false
    }
  );

  const filterLicensesUnderBusiness = useMemo(() => {
    const filteredLicensesBySearch = licensesUnderBusinessQuery.data?.filter(
      (license) =>
        license?.user?.firstName.toLocaleLowerCase().match(searchInput.toLocaleLowerCase()) ||
        license?.user?.lastName.toLocaleLowerCase().match(searchInput.toLocaleLowerCase())
    );

    return searchInput ? filteredLicensesBySearch : licensesUnderBusinessQuery.data;
  }, [licensesUnderBusinessQuery.data, searchInput]);

  const user = businessQuery.data;
  const removeSelectButton = { DropdownIndicator: null, IndicatorSeparator: null };
  const handleModalOpen = async () => {
    modalAssignStudentBusiness.onOpen();

    const userRef = await collection(db, 'users')
    const userSnap = query(userRef.withConverter<UserDetailsWithId>({
      fromFirestore: (doc) => {
        return {
          id: doc.id,
          ...(doc.data() as UserDetails)
        };
      },
      toFirestore: (doc: UserDetailsWithId) => doc
    }), orderBy('firstName'))


    const userDocs = await getDocs(userSnap)
    const studentsOptions = userDocs.docs
      .filter((doc) => isNil(doc.data().businessId))
      .map((doc) => {
        return {
          value: doc.data().id,
          label: `${doc.data().firstName} ${doc.data().lastName}`,
          license: doc.data().licenseId
        };
      });
    setStudentsOptions(studentsOptions);
  };

  const onAssignStudentConfirm = async () => {
    const { selectedClients } = form.getValues();
    const isRequiredFieldEmpty = !selectedClients || (Array.isArray(selectedClients) && selectedClients.length === 0);

    if (isRequiredFieldEmpty) {
      return;
    }

    return modalAssignStudentBusinessConfirm.mutate(selectedClients);
  };

  const modalAssignStudentBusinessConfirm = useMutation(
    ['assignUsersToBusiness'],
    async (selectedClients: any) => {
      const resp = await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/assignUsersToBusiness`, {
        users: selectedClients,
        businessId: business
      });

      return resp.data;
    },
    {
      onSuccess() {
        toast.success('Business students updated.');
        studentsUnderBusinessQuery.refetch();
        modalAssignStudentBusiness.onClose();
      },
      onError(err) {
        console.error('err', err);
        toast.error('Something went wrong.');
      }
    }
  );

  return (
    <BasePage spacing="md">
      <BasePageTitle title="Business Details" paddingX="lg" paddingBottom="lg" showGoBack={true} />
      <ChakraFlex gridGap="xl" flexDirection="column">
        <ChakraFlex gridGap="lg">
          <ChakraFormControl>
            <ChakraFormLabel>First Name</ChakraFormLabel>
            <ChakraInput
              borderRadius="sm"
              borderColor="gray.400"
              isDisabled={true}
              value={user?.name.split(' ').slice(0, -1).join(' ')}
            />
          </ChakraFormControl>
          <ChakraFormControl>
            <ChakraFormLabel>Last Name</ChakraFormLabel>
            <ChakraInput
              borderRadius="sm"
              borderColor="gray.400"
              isDisabled={true}
              value={user?.name.split(' ').slice(-1).join(' ')}
            />
          </ChakraFormControl>
          <ChakraFormControl>
            <ChakraFormLabel>E-mail</ChakraFormLabel>
            <ChakraInput borderRadius="sm" borderColor="gray.400" isDisabled={true} value={user?.email} />
          </ChakraFormControl>
        </ChakraFlex>
        <ChakraFlex gridGap="lg">
          <ChakraFormControl>
            <ChakraFormLabel>License Price</ChakraFormLabel>
            <ChakraInput
              borderRadius="sm"
              borderColor="gray.400"
              isDisabled={true}
              value={`$${user?.licensePrice}.00`}
            />
          </ChakraFormControl>
          <ChakraFormControl>
            <ChakraFormLabel>Amount of Purchased Licenses</ChakraFormLabel>
            <ChakraInput borderRadius="sm" borderColor="gray.400" isDisabled={true} value={user?.quantity} />
          </ChakraFormControl>
        </ChakraFlex>
        <BaseCard title="Students">
          <ChakraButton
            borderRadius="sm"
            colorScheme="orange"
            leftIcon={<Icon name="invite" />}
            size="sm"
            float="right"
            onClick={() => handleModalOpen()}
          >
            Assign student to business
          </ChakraButton>
          <StudentsPanelFilters students={studentsUnderBusinessQuery?.data ?? []} />
          <StudentsPanelListing
            isLoading={studentsUnderBusinessQuery.isLoading}
            students={studentsUnderBusinessQuery?.data ?? []}
          />
        </BaseCard>
        <BaseCard title="Licenses">
          <ChakraFlex marginBottom="md" alignItems="center" justifyContent="space-between">
            <ChakraFlex>
              <ChakraInputGroup width="340px" marginRight="md">
                <ChakraInput
                  placeholder="Search License"
                  borderRadius="sm"
                  value={searchInput}
                  onChange={({ target }) => setSearchInput(target.value)}
                />
                <ChakraInputRightElement>
                  <Icon size="sm" borderColor="gray.500" name="search" />
                </ChakraInputRightElement>
              </ChakraInputGroup>
              <ChakraInputGroup marginBottom="md">
                <ChakraInputLeftAddon
                  width="112px"
                  color="white"
                  fontWeight="normal"
                  background="gray.500"
                  borderLeftRadius="sm"
                >
                  Status
                </ChakraInputLeftAddon>
                <ChakraSelect borderLeftRadius="none" borderRightRadius="sm" name="status" {...form.register('status', { required: true })}>
                  <option value="">No Filter</option>
                  {licenseStatusOptions.map((value, idx) => (
                    <option value={value} key={idx}>
                      {value}
                    </option>
                  ))}
                </ChakraSelect>
              </ChakraInputGroup>
            </ChakraFlex>
          </ChakraFlex>
          <LicensesUnderBusinessPanel
            isLoading={licensesUnderBusinessQuery.isLoading}
            data={filterLicensesUnderBusiness}
          />
        </BaseCard>
      </ChakraFlex>
      <Modal
        title="Assign student to this business"
        onConfirm={onAssignStudentConfirm}
        showFooter={true}
        {...modalAssignStudentBusiness}
      >
        <Controller
          name="selectedClients"
          control={form.control}
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value, name, ref } }) => (
            <Select
              name={name}
              ref={ref}
              onBlur={onBlur}
              isMulti
              required
              components={removeSelectButton}
              options={studentsOptions}
              placeholder="Select Clients"
              closeMenuOnSelect={false}
              onChange={onChange}
              value={value}
              tagVariant="solid"
            />
          )}
        />
      </Modal>
    </BasePage>
  );
};
