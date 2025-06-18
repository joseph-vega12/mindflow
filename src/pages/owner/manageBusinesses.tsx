import React, { FC, useMemo, useState } from 'react';

import {
  chakra,
  Button as ChakraButton,
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputLeftElement as ChakraInputLeftElement,
  InputRightElement as ChakraInputRightElement,
  Modal as ChakraModal,
  ModalBody as ChakraModalBody,
  ModalCloseButton as ChakraModalCloseButton,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalHeader as ChakraModalHeader,
  ModalOverlay as ChakraModalOverlay,
  SimpleGrid as ChakraSimpleGrid,
  Text as ChakraText,
  useDisclosure
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';

import { Icon } from 'components/common';

import { Business, BusinessDocumentWithId } from 'types';

import { ManageBusinessPanelListing } from 'components/Pages/Owner/OwnerManageBusinessesPanel';

import { AddBusinessUserForm } from './business/businessUserAdd';
import { toast } from 'react-toastify';
import { collection, doc, getDocs, limit, query, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const OwnerManageBusinessesPanel: FC = () => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState('');
  const [editedBusinessId, setEditedLicenseId] = useState<string>();

  const modalDisclosure = useDisclosure();
  const modalAddBusinessForm = useDisclosure();

  const { register, handleSubmit, getValues, reset } = useForm({});
  const businessQuery = useQuery(
    ['query:businesses'],
    async () => {
      const businessesSnap = query(
        collection(db, 'business')
          .withConverter<BusinessDocumentWithId>({
            fromFirestore: (doc) => ({ id: doc.id, ...(doc.data() as Business) }),
            toFirestore: (doc: Business) => doc
          }),
        limit(200)
      )

      const businessApprovalDocs = await getDocs(businessesSnap);
      const businessApprovals = businessApprovalDocs.docs.map((d) => d.data());

      return businessApprovals;
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false
    }
  );

  const { mutate: businessMutation, isLoading } = useMutation(async () => {
    const values = getValues();
    try {
      if (isEditMode) {
        const businessRef = doc(db, 'business', editedBusinessId);

        await updateDoc(businessRef, {
          licensePrice: Number(values.licensePrice)
        });

        setIsEditMode(false);
        setEditedLicenseId(undefined);

        toast.success('Business updated');

        reset({ licensePrice: values.licensePrice });
      }

      modalDisclosure.onClose();

      await businessQuery.refetch();
    } catch (error) {
      toast.error('An error has occurred, try  again!');
    }
  });

  const { mutate: switchEnablePurchaseMutation } = useMutation(async (data: Business) => {
    try {
      const isBuyingEnabled = !data.isBuyingEnabled;
      await updateDoc(doc(db, 'business', data.id), { isBuyingEnabled: isBuyingEnabled });

      toast.success(data.isBuyingEnabled ? 'Business Disabled' : 'Business Enabled');
      await businessQuery.refetch();
    } catch (error) {
      toast.error('An error has occurred, try  again!');
    }
  });

  const handleBusinessEdit = (business) => {
    setIsEditMode(true);
    setEditedLicenseId(business.id);
    reset({
      ...business
    });
    modalDisclosure.onOpen();
  };

  const handleEnablePurchase = (business) => {
    switchEnablePurchaseMutation(business);
  };

  const onSubmit = () => {
    businessMutation();
  };

  const getFilteredBusinessApprovals = useMemo(
    () =>
      businessQuery.data?.filter(
        (business) =>
          business?.name?.toLocaleLowerCase().match(searchInput.toLowerCase()) ||
          business?.email?.toLocaleLowerCase().match(searchInput.toLowerCase())
      ),
    [businessQuery.data, searchInput]
  );

  return (
    <ChakraFlex flexDirection="column">
      <ChakraFlex marginBottom="md" justifyContent="space-between" alignItems="center">
        <ChakraInputGroup width="340px">
          <ChakraInput
            placeholder="Search Business"
            borderRadius="sm"
            value={searchInput}
            onChange={({ target }) => setSearchInput(target.value)}
          />
          <ChakraInputRightElement>
            <Icon size="sm" borderColor="gray.500" name="search" />
          </ChakraInputRightElement>
        </ChakraInputGroup>
        <ChakraButton
          borderRadius="sm"
          colorScheme="orange"
          leftIcon={<Icon name="invite" />}
          size="sm"
          marginRight="sm"
          onClick={() => modalAddBusinessForm.onOpen()}
        >
          Add business user
        </ChakraButton>
      </ChakraFlex>
      <ManageBusinessPanelListing
        data={getFilteredBusinessApprovals ?? []}
        isLoading={isLoading}
        onEditBusiness={(business) => handleBusinessEdit(business)}
        onToggleSwitch={(business) => handleEnablePurchase(business)}
        refetch={businessQuery.refetch}
      />
      <ChakraModal isCentered size="lg" isOpen={modalDisclosure.isOpen} onClose={() => modalDisclosure.onClose()}>
        <ChakraModalOverlay />
        <chakra.form onSubmit={handleSubmit(onSubmit)}>
          <ChakraModalContent borderRadius="sm">
            <ChakraModalHeader borderBottom="sm" borderBottomColor="gray.300">
              Edit license price
            </ChakraModalHeader>
            <ChakraModalCloseButton top="12px" />
            <ChakraModalBody paddingY="lg">
              <ChakraSimpleGrid width="100%" columns={2} gap="md">
                <ChakraFlex flexDirection="column">
                  <ChakraFormLabel>Price Per License</ChakraFormLabel>
                  <ChakraInputGroup>
                    <ChakraInputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
                      $
                    </ChakraInputLeftElement>
                    <ChakraInput
                      required
                      type="number"
                      name="licensePrice"
                      borderColor="gray.500"
                      disabled={isLoading}
                      {...register("licensePrice")}
                      placeholder="Enter amount"
                    />
                  </ChakraInputGroup>
                </ChakraFlex>
              </ChakraSimpleGrid>
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
                Edit Price
              </ChakraButton>
            </ChakraModalFooter>
          </ChakraModalContent>
        </chakra.form>
      </ChakraModal>
      <ChakraModal
        isCentered
        size="2xl"
        isOpen={modalAddBusinessForm.isOpen}
        onClose={() => modalAddBusinessForm.onClose()}
      >
        <ChakraModalOverlay />
        <ChakraModalContent borderRadius="sm">
          <ChakraModalHeader borderBottom="sm" borderBottomColor="gray.300">
            Add Business user form
          </ChakraModalHeader>
          <ChakraModalCloseButton />
          <ChakraModalBody>
            <AddBusinessUserForm isLoading={isLoading} onSubmit={onSubmit} businessData={businessQuery.data} />
          </ChakraModalBody>
        </ChakraModalContent>
      </ChakraModal>
    </ChakraFlex>
  );
};
