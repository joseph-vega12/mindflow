import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import React, { FC } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
  Input as ChakraInput,
  Modal as ChakraModal,
  ModalBody as ChakraModalBody,
  ModalCloseButton as ChakraModalCloseButton,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalHeader as ChakraModalHeader,
  ModalOverlay as ChakraModalOverlay,
  ModalProps as ChakraModalProps,
  Select as ChakraSelect,
  SimpleGrid as ChakraSimpleGrid,
  Text as ChakraText
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { ELicenseStatus, ELicenseType, License, LicenseDocumentWithId } from 'types';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

interface Props extends Omit<ChakraModalProps, 'children'> { }

interface FormValues {
  numberOfLicenses: number;
  durationDays: number;
  isForSchoolDistrict: 'yes' | 'no';
  districtId: string;
}

type SubmitPayload =
  | { numberOfLicenses: number; durationDays: number }
  | { numberOfLicenses: number; durationDays: number; isForSchoolDistrict: 'yes'; districtId: string };

export const BatchLicenseDialog: FC<Props> = ({ isOpen, onClose }) => {
  const { register, getValues, watch } = useForm<FormValues>({
    defaultValues: {
      numberOfLicenses: 1,
      durationDays: 90,
      isForSchoolDistrict: 'no',
      districtId: ''
    }
  });

  const isForSchoolDistrict = watch('isForSchoolDistrict') === 'yes';

  const createBatchLicensesMutation = useMutation(async (values: SubmitPayload) => {
    const licensesNumber = Array.from(Array(Number(values.numberOfLicenses)));
    const emptyLicense: License = {
      status: ELicenseStatus.INACTIVE,
      type: ELicenseType.INDIVIDUAL,

      orderId: '',
      provider: 'manual_sell',

      durationDays: Number(values.durationDays),
      purchaseDate: +new Date(),
      ...('districtId' in values && values.districtId ? { districtId: values.districtId } : {}),
      // activationDate: +new Date(),

      timestamp: +new Date()
    };

    const batch = writeBatch(db);

    const transactionId = uuidv4();

    const licenses: LicenseDocumentWithId[] = [];
    for (const _ of licensesNumber) {
      const licenseRef = doc(collection(db, 'licenses'));

      batch.set(licenseRef, emptyLicense);
      licenses.push({ id: licenseRef.id, ...emptyLicense, orderId: transactionId });
    }

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
    const licensesCsv = licenses.reduce((prev, license) => {
      const { id, status, type, purchaseDate, activationDate, expirationDate, user } = license;

      const activationLink = `${window.location.origin}/activate-license/${id}`;
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
      fileName: `${moment().format('MM/DD/YYYY HH:mm:ss')}-batch-licenses-export.csv`,
      fileType: 'text/csv'
    });

    await batch.commit();
  });

  const handleSubmit = () => {
    const values = getValues();

    const payload: SubmitPayload =
      values.isForSchoolDistrict === 'yes'
        ? {
          numberOfLicenses: values.numberOfLicenses,
          durationDays: values.durationDays,
          isForSchoolDistrict: 'yes',
          districtId: values.districtId
        }
        : {
          numberOfLicenses: values.numberOfLicenses,
          durationDays: values.durationDays
        };

    createBatchLicensesMutation.mutate(payload);
  };

  return (
    <ChakraModal isCentered size="lg" isOpen={isOpen} onClose={onClose}>
      <ChakraModalOverlay />
      <ChakraModalContent borderRadius="sm">
        <ChakraModalHeader borderBottom="sm" borderBottomColor="gray.300">
          Create multiple licenses
        </ChakraModalHeader>
        <ChakraModalCloseButton top="12px" borderRadius="sm" />
        <ChakraModalBody paddingY="lg">
          <ChakraSimpleGrid width="100%" columns={2} gap="md">
            <ChakraFlex flexDirection="column">
              <ChakraFormLabel>Number of licenses</ChakraFormLabel>
              <ChakraInput
                required
                type="number"
                name="numberOfLicenses"
                borderColor="gray.500"
                disabled={createBatchLicensesMutation.isLoading}
                {...register("numberOfLicenses")}
              />
            </ChakraFlex>

            <ChakraFlex flexDirection="column">
              <ChakraFormLabel>Duration days</ChakraFormLabel>
              <ChakraInput
                required
                type="number"
                name="durationDays"
                borderColor="gray.500"
                disabled={createBatchLicensesMutation.isLoading}
                {...register("durationDays")}
              />
            </ChakraFlex>

            <ChakraFlex flexDirection="column" gridColumn="1 / -1">
              <ChakraFormLabel>Is this for a school/district?</ChakraFormLabel>
              <ChakraSelect
                name="isForSchoolDistrict"
                borderColor="gray.500"
                disabled={createBatchLicensesMutation.isLoading}
                {...register("isForSchoolDistrict")}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </ChakraSelect>
            </ChakraFlex>

            {isForSchoolDistrict && (
              <ChakraFlex flexDirection="column" gridColumn="1 / -1">
                <ChakraFormLabel>District ID</ChakraFormLabel>
                <ChakraInput
                  type="text"
                  name="districtId"
                  placeholder="Enter district ID"
                  borderColor="gray.500"
                  disabled={createBatchLicensesMutation.isLoading}
                  {...register("districtId")}
                />
              </ChakraFlex>
            )}
          </ChakraSimpleGrid>
        </ChakraModalBody>
        <ChakraModalFooter borderTop="sm" borderTopColor="gray.300" justifyContent="space-between">
          <ChakraText cursor="pointer" colorScheme="blue" marginRight="lg" onClick={onClose}>
            Close
          </ChakraText>
          <ChakraButton
            borderRadius="sm"
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={createBatchLicensesMutation.isLoading}
          >
            Create licenses
          </ChakraButton>
        </ChakraModalFooter>
      </ChakraModalContent>
    </ChakraModal>
  );
};
