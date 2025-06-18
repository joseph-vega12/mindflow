import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import React, { FC, useMemo } from 'react';

import { Button as ChakraButton, Flex as ChakraFlex } from '@chakra-ui/react';
import { Column } from 'react-table';
import { formatTimestamp } from 'lib/utils';
import { toast } from 'react-toastify';
import { useMutation } from 'react-query';
import axios from 'axios';
import generator from 'generate-password';

import { Icon, Table } from 'components/common';

import {
  BusinessApprovalDocumentWithId,
  BusinessApprovalStatus,
  ELicenseStatus,
  ELicenseType,
  License,
  LicenseDocumentWithId
} from 'types';
import { useFirebaseContext } from 'lib/firebase';

const CLOUD_FUNCTION_URL = process.env.REACT_APP_CLOUD_FUNCTIONS_URL;

interface BusinessApprovalsPanelListingProps {
  data?: BusinessApprovalDocumentWithId[];
  isLoading?: boolean;
  refetch: () => void;
}

export const BusinessApprovalsPanelListing: FC<BusinessApprovalsPanelListingProps> = ({ data, refetch }) => {
  const { firestore } = useFirebaseContext();
  const generateTemporaryPassword = () => {
    return generator.generate({
      length: 20,
      numbers: true,
      symbols: true
    });
  };
  const businessApprovalMutation = useMutation(
    async (
      data: Pick<
        BusinessApprovalDocumentWithId,
        | 'id'
        | 'status'
        | 'businessName'
        | 'name'
        | 'email'
        | 'phone'
        | 'orderId'
        | 'provider'
        | 'gatewayResponse'
        | 'quantity'
      >
    ) => {
      const generatedPassword: string = generateTemporaryPassword();

      const firstName = data.name.split(' ').slice(0, -1).join(' ');
      const lastName = data.name.split(' ').slice(-1).join(' ');

      const activateLicenseResponse = await axios.post(`${CLOUD_FUNCTION_URL}/activateSoldLicense`, {
        user: {
          firstName: firstName,
          lastName: lastName,
          name: data.name,
          email: data.email,
          difficultLevel: 'adult',
          testType: 'gmat'
        },
        password: generatedPassword,
        orderId: data.orderId,
        provider: data.provider,
        quantity: data.quantity,
        businessName: data.businessName,
        finished: true
      });
      const approvalResponse = await axios.put(`${CLOUD_FUNCTION_URL}/approveBusiness`, {
        id: data.id,
        status: data.status
      });
      const sendTemporaryPassword = await axios.post(`${CLOUD_FUNCTION_URL}/temporaryPassword`, {
        email: data.email,
        temporaryPassword: generatedPassword
      });

      // Student License Creation under the Business
      const licensesNumber = Array.from(Array(Number(data.quantity)));
      const emptyLicense: License = {
        businessId: activateLicenseResponse.data.businessId,
        status: ELicenseStatus.INACTIVE,
        type: ELicenseType.BUSINESS_STUDENT,
        orderId: '',
        provider: 'manual_sell',
        durationDays: 90,
        purchaseDate: +new Date(),
        timestamp: +new Date()
      };

      const batch = firestore.batch();
      const transactionId = uuidv4();

      const licenses: LicenseDocumentWithId[] = [];
      for (const _ of licensesNumber) {
        const licenseRef = firestore.collection('licenses').doc();
        batch.set(licenseRef, emptyLicense);
        licenses.push({ id: licenseRef.id, ...emptyLicense, orderId: transactionId });
      }

      const licensesCsv = licenses.reduce((prev, license) => {
        const { id, status, type, purchaseDate, activationDate, expirationDate, user } = license;

        const activationLink = `${window.location.origin}/activate-license/${id}`;
        const row = {
          id: id,
          status: status,
          activationLink: activationLink,
          type: type,
          user: user?.firstName ? `${user?.firstName} ${user?.lastName}` : '',
          email: user?.email,
          purchaseDate: moment(purchaseDate).format('MM/DD/YYYY'),
          activationDate: moment(activationDate).format('MM/DD/YYYY'),
          expirationDate: moment(expirationDate).format('MM/DD/YYYY')
        };

        prev.push(row);
        return prev;
      }, []);

      const sendStudentLicenses = await axios.post(`${CLOUD_FUNCTION_URL}/sendBusinessStudentLicenses`, {
        email: data.email,
        licenses: licensesCsv
      });

      await batch.commit();

      return Promise.all([activateLicenseResponse, approvalResponse, sendTemporaryPassword, sendStudentLicenses]);
    },
    {
      onSuccess: () => {
        refetch();
        toast.success('APPROVED');
      },
      onError({ response }: { response: { data: { message: string } } }) {
        toast.error(response?.data?.message ?? 'Unknown error');
      }
    }
  );
  const businessDenyMutation = useMutation(
    async (data: Pick<BusinessApprovalDocumentWithId, 'id' | 'status'>) => {
      const denyLicenseResponse = axios.put(`${CLOUD_FUNCTION_URL}/approveBusiness`, {
        id: data.id,
        status: data.status
      });

      return denyLicenseResponse;
    },
    {
      onSuccess: () => {
        refetch();
        toast.success('REJECTED');
      },
      onError({ response }: { response: { data: { message: string } } }) {
        toast.error(response?.data?.message ?? 'Unknown error');
      }
    }
  );

  const getTableColumns = useMemo<Column<BusinessApprovalDocumentWithId>[]>(() => {
    return [
      { width: '15%', Header: 'Name', accessor: 'businessName' },
      { width: '15%', Header: 'Email', accessor: 'email' },
      { width: '15%', Header: 'Status', accessor: 'status' },
      { width: '15%', Header: 'Number of licenses', accessor: 'quantity' },
      {
        width: '15%',
        Header: 'date',
        accessor: (row) => {
          return formatTimestamp(row.timestamp, 'MM/DD/YYYY - HH:mm:ss');
        }
      },
      {
        id: 'action',
        width: '10%',
        Header: 'Options',
        accessor: (business) => {
          if (business.status !== BusinessApprovalStatus.PENDING_APPROVAL) {
            return <></>;
          }
          return (
            <ChakraFlex alignItems="center">
              <ChakraButton
                size="sm"
                marginRight="sm"
                colorScheme="blue"
                borderRadius="sm"
                leftIcon={<Icon size="sm" name="check" />}
                onClick={() =>
                  businessApprovalMutation.mutate({
                    id: business.id,
                    status: BusinessApprovalStatus.APPROVED,
                    businessName: business.businessName,
                    email: business.email,
                    name: business.name,
                    orderId: business.orderId,
                    provider: business.provider,
                    gatewayResponse: business.gatewayResponse,
                    quantity: business.quantity,
                    phone: business.phone
                  })
                }
              >
                Approve
              </ChakraButton>
              <ChakraButton
                size="sm"
                borderRadius="sm"
                colorScheme="red"
                leftIcon={<Icon size="sm" name="not-allowed" />}
                onClick={() =>
                  businessDenyMutation.mutate({ id: business.id, status: BusinessApprovalStatus.REJECTED })
                }
              >
                Deny
              </ChakraButton>
            </ChakraFlex>
          );
        }
      }
    ];
  }, [data]);

  return (
    <Table isPageable={true} isLoading={businessApprovalMutation.isLoading} columns={getTableColumns} data={data} />
  );
};
