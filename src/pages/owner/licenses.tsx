import moment from 'moment';

import React, { FC, useMemo, useState } from 'react';

import {
  chakra,
  Button as ChakraButton,
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
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
  Select as ChakraSelect,
  SimpleGrid as ChakraSimpleGrid,
  Text as ChakraText,
  useDisclosure
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';

import { formatTimestamp } from 'lib/utils';
import { useFirebaseContext } from 'lib/firebase';

import { ELicenseStatus, ELicenseType, License, LicenseDocumentWithId, UserDocumentWithId } from 'types';

import { Icon } from 'components/common';

import { BatchLicenseDialog, LicensePanelListing } from 'components/Pages/Owner/OwnerLicensePanel';
import { addDoc, collection, doc, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';
export interface LicenseWithUserAndExtension extends LicenseDocumentWithId {
  user: UserDocumentWithId | undefined;
  extensionDays?: 0 | 30 | 90 | 120;
}
export const OwnerLicensePanel: FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedLicenseId, setEditedLicenseId] = useState<string>();
  const [selectedLicenses, setSelectedLicenses] = useState<LicenseDocumentWithId[]>([]);

  const modalDisclosure = useDisclosure();
  const batchModalDisclosure = useDisclosure();
  const { register, handleSubmit, getValues, reset, control } = useForm<LicenseWithUserAndExtension>({});

  const { mutate: licenseMutation, isLoading } = useMutation(async () => {
    const values: LicenseWithUserAndExtension = getValues();
    try {
      if (isEditMode) {
        const totalDays = Number(values.extensionDays);
        const willExtend = totalDays > 0;
        const today = moment();
        const newExtendedDate = today.add(totalDays, 'days').format('MM-DD-YYYY');

        const newExpirationDate = willExtend
          ? +new Date(newExtendedDate)
          : values.expirationDate
            ? +new Date(values.expirationDate)
            : +new Date();

        const newLicenseStatus = willExtend
          ? ELicenseStatus.ACTIVE
          : today.isAfter(values.expirationDate)
            ? ELicenseStatus.EXPIRED
            : ELicenseStatus.ACTIVE;
        const start = moment();
        const end = moment(newExtendedDate);
        await updateDoc(doc(db, 'licenses', editedLicenseId), {
          ...values,
          expirationDate: newExpirationDate,
          status: newLicenseStatus,
          durationDays: end.diff(start, 'days') + 1
        });

        setIsEditMode(false);
        setEditedLicenseId(undefined);
        toast.success('License updated');
        reset({ durationDays: moment.duration(end.diff(start)).asDays() });
      } else {
        const durationDays = values.durationDays ?? 90;
        await addDoc(collection(db, 'licenses'), {
          status: ELicenseStatus.ACTIVE,
          type: ELicenseType.BETA_USER,

          orderId: ELicenseType.BETA_USER,
          durationDays,
          purchaseDate: +new Date(),
          activationDate: +new Date(),
          expirationDate: +new Date(Date.now() + durationDays * 86400000),

          timestamp: +new Date()
        });

        toast.success('License created');
      }

      modalDisclosure.onClose();

      await licensesQuery.refetch();
    } catch (error) {
      toast.error('An error has occurred, try  again!');
    }
  });

  const licensesQuery = useQuery(['query:licenses'], async () => {
    const licensesSnap =
      collection(db, 'licenses')
        .withConverter<LicenseDocumentWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as License)
            };
          },
          toFirestore: (doc: LicenseDocumentWithId) => doc
        })

    const licenseDocs = await getDocs(licensesSnap)
    const licenses = licenseDocs.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    return licenses;
  });

  const exportLicenses = () => {
    const downloadFile = ({ data, fileName, fileType }) => {
      // Create a blob with the data we want to download as a file
      const blob = new Blob([data], { type: fileType });
      // Create an anchor element and dispatch a click event on it
      // to trigger a download
      const a = document.createElement('a');
      a.download = fileName;
      a.href = window.URL.createObjectURL(blob);
      const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      a.dispatchEvent(clickEvt);
      a.remove();
    };

    // Headers for each column
    const headers =
      'Id,Status,Activation Link,Type,Student Name, Student Email,Purchase Date,Activation Date,Expiration Date';

    // Convert users data to a csv
    const licensesCsv = licensesQuery.data.reduce((prev, license) => {
      const { id, status, type, purchaseDate, activationDate, expirationDate, user } = license;

      const activationLink = status === 'ACTIVE' ? '-' : `${window.location.origin}/activate-license/${id}`;
      const row = [
        id,
        status,
        activationLink,
        type,
        user?.firstName ? `${user?.firstName} ${user?.lastName}` : '-',
        user?.email ?? '-',
        moment(purchaseDate).format('MM/DD/YYYY'),
        moment(activationDate).format('MM/DD/YYYY'),
        moment(expirationDate).format('MM/DD/YYYY')
      ];

      prev.push(row.join(','));
      return prev;
    }, []);

    downloadFile({
      data: [headers, ...licensesCsv].join('\n'),
      fileName: `${moment().format('MM/DD/YYYY HH:mm:ss')}-licenses-export.csv`,
      fileType: 'text/csv'
    });
  };

  const handleLicenseEdit = (license: LicenseDocumentWithId) => {
    setIsEditMode(true);
    setEditedLicenseId(license.id);

    reset({
      ...license,
      extensionDays: 0,
      // @ts-ignore
      activationDate: formatTimestamp(license.activationDate as number, 'YYYY-MM-DD'),
      // @ts-ignore
      expirationDate: formatTimestamp(license.expirationDate as number, 'YYYY-MM-DD'),
      // @ts-ignore
      purchaseDate: formatTimestamp(license.purchaseDate, 'YYYY-MM-DD')
    });

    modalDisclosure.onOpen();
  };

  const handleSelectedLicenseDelete = async () => {
    setIsDeleting(true);

    const batch = writeBatch(db)

    selectedLicenses.forEach((lDoc) => {
      const reference = doc(collection(db, 'licenses'), lDoc.id);

      batch.delete(reference);
    });

    await batch.commit();

    licensesQuery.refetch();

    setSelectedLicenses([]);
    setIsDeleting(false);
  };

  const previewExpirationDate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values: LicenseWithUserAndExtension = getValues();
    const extendDays = Number(e.target.value);

    reset({
      ...values,
      // @ts-ignore
      expirationDate: moment().add(extendDays, 'days').format('YYYY-MM-DD')
    });
  };

  const onSubmit = async () => {
    licenseMutation();
  };

  const getFilteredLicenses = useMemo(() => {
    const getFilteredLicenses = licensesQuery?.data
      ?.filter(({ status }) => (showExpired ? status === ELicenseStatus.EXPIRED : status === ELicenseStatus.ACTIVE))
      .sort((a, b) => (a?.user?.firstName < b?.user?.firstName ? -1 : 1));

    const filteredLicensesBySearch = getFilteredLicenses?.filter(
      (license) =>
        license.user?.firstName?.toLocaleLowerCase().match(searchInput.toLocaleLowerCase()) ||
        license.user?.lastName?.toLocaleLowerCase().match(searchInput.toLocaleLowerCase())
    );

    return filteredLicensesBySearch ?? [];
  }, [licensesQuery.data, showExpired, searchInput]);

  return (
    <ChakraFlex flexDirection="column">
      <ChakraFlex marginBottom="md" alignItems="center" justifyContent="space-between" gridGap="md">
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
        </ChakraFlex>
        <ChakraFlex gridGap="md">
          <ChakraButton borderRadius="sm" colorScheme="gray" onClick={() => setShowExpired(!showExpired)}>
            Show {showExpired ? 'Active' : 'Expired'}
          </ChakraButton>
          <ChakraButton
            borderRadius="sm"
            colorScheme="green"
            leftIcon={<Icon name="export" />}
            onClick={exportLicenses}
          >
            Export licenses
          </ChakraButton>
          <ChakraButton
            borderRadius="sm"
            colorScheme="blue"
            leftIcon={<Icon name="small-add" />}
            onClick={() => batchModalDisclosure.onOpen()}
          >
            Create multiple licenses
          </ChakraButton>
          <ChakraButton
            colorScheme="red"
            rightIcon={<Icon name="not-allowed" />}
            isLoading={isDeleting}
            isDisabled={!selectedLicenses?.length}
            onClick={() => handleSelectedLicenseDelete()}
          >
            Delete ({selectedLicenses?.length}) licenses
          </ChakraButton>
        </ChakraFlex>
      </ChakraFlex>
      <LicensePanelListing
        isLoading={licensesQuery.isLoading}
        data={getFilteredLicenses || []}
        onEditLicense={(license) => handleLicenseEdit(license)}
        onSelectedRows={(rows) => setSelectedLicenses(rows)}
      />

      <BatchLicenseDialog {...batchModalDisclosure} />

      <ChakraModal isCentered size="lg" isOpen={modalDisclosure.isOpen} onClose={() => modalDisclosure.onClose()}>
        <ChakraModalOverlay />
        <chakra.form onSubmit={handleSubmit(onSubmit)}>
          <ChakraModalContent borderRadius="sm">
            <ChakraModalHeader borderBottom="sm" borderBottomColor="gray.300">
              {isEditMode ? 'Edit license' : 'Register license'}
            </ChakraModalHeader>
            <ChakraModalCloseButton top="12px" />
            <ChakraModalBody paddingY="lg">
              <ChakraSimpleGrid width="100%" columns={2} gap="md">
                {!isEditMode && (
                  <ChakraFlex flexDirection="column">
                    <ChakraFormLabel>Duration days</ChakraFormLabel>
                    <ChakraInput
                      required
                      type="number"
                      name="durationDays"
                      borderColor="gray.500"
                      disabled={isLoading}
                      {...register("durationDays")}
                    />
                  </ChakraFlex>
                )}
                <ChakraFlex flexDirection="column">
                  <ChakraFormLabel>Purchase date</ChakraFormLabel>
                  <ChakraInput type="date" name="purchaseDate" borderColor="gray.500" disabled {...register("purchaseDate")} />
                </ChakraFlex>
                <ChakraFlex flexDirection="column">
                  <ChakraFormLabel>Activation date</ChakraFormLabel>
                  <ChakraInput type="date" name="activationDate" borderColor="gray.500" disabled {...register("activationDate")} />
                </ChakraFlex>
                <ChakraFlex flexDirection="column">
                  <ChakraFormLabel>Expiration date</ChakraFormLabel>
                  <ChakraInput
                    required
                    type="date"
                    name="expirationDate"
                    borderColor="gray.500"
                    disabled
                    {...register("expirationDate")}
                  />
                </ChakraFlex>
                {isEditMode && (
                  <ChakraFlex flexDirection="column">
                    <ChakraFormLabel>Extend license</ChakraFormLabel>
                    <Controller
                      name="extensionDays"
                      control={control}
                      render={({ field }) => (
                        <ChakraSelect
                          {...field}
                          borderColor="gray.500"
                          disabled={isLoading}
                          onChange={(e) => {
                            field.onChange(e); // keep form state updated
                            previewExpirationDate(e); // your custom logic
                          }}
                        >
                          <option value={0}>-</option>
                          <option value={3}>3 days</option>
                          <option value={7}>7 days</option>
                          <option value={30}>30 days</option>
                          <option value={90}>90 days</option>
                          <option value={120}>120 days</option>
                        </ChakraSelect>
                      )}
                    />
                  </ChakraFlex>
                )}
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
                {isEditMode ? 'Edit license' : 'Register license'}
              </ChakraButton>
            </ChakraModalFooter>
          </ChakraModalContent>
        </chakra.form>
      </ChakraModal>
    </ChakraFlex>
  );
};
