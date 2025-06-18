import { sortBy } from 'lodash';
import React, { FC, useCallback } from 'react';

import {
  Button,
  Divider as ChakraDivider,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Modal as ChakraModal,
  ModalBody as ChakraModalBody,
  ModalContent as ChakraModalContent,
  ModalHeader as ChakraModalHeader,
  ModalOverlay as ChakraModalOverlay,
  Text as ChakraText
} from '@chakra-ui/react';

import { useAuthContext } from 'lib/firebase';

import { FirebaseObjectWithKey, License, UserDetails } from 'types';
import { Icon, Table } from 'components/common';
import { useBusiness } from 'lib/customHooks';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TableItem = {
  license: FirebaseObjectWithKey<License>;
  user?: UserDetails;
};

export const LicensesModal: FC<Props> = ({ isOpen, onClose }) => {
  const { user } = useAuthContext();

  const { businessUsersQuery, businessLicensesQuery } = useBusiness();
  const navigate = useNavigate();

  const tableColumns = [
    {
      Header: 'Status',
      width: '30%',
      accessor: (row: TableItem) => {
        const colors: Record<License['status'], string> = {
          ACTIVE: 'green.700',
          EXPIRED: 'red.700',
          INACTIVE: 'yellow.700'
        };
        return (
          <ChakraText isTruncated={true} textAlign="center" color={colors[row.license.status]}>
            {row.license.status}
          </ChakraText>
        );
      }
    },
    {
      Header: 'Student Name',
      width: '30%',
      accessor: (row: TableItem) => {
        return (
          <ChakraText isTruncated={true} textAlign="center">
            {row.license.user?.firstName} {row.license.user?.lastName}
          </ChakraText>
        );
      }
    },
    {
      Header: 'Student Email',
      width: '30%',
      accessor: (row: TableItem) => {
        return (
          <ChakraText isTruncated={true} textAlign="center">
            {row.license.user?.email}
          </ChakraText>
        );
      }
    },
    {
      Header: 'Action',
      width: '30%',
      accessor: (row: TableItem) => {
        const handleClick = () => {
          if (row.user) {
            navigate(`/business/${row.license.user?.id}/details`);
          } else {
            navigator.clipboard.writeText(`https://app.mindflowspeedreading.com/activate-license/${row.license.id}`);
            toast.success('Copied to clipboard!');
          }
        };
        return (
          <ChakraFlex justifyContent="center">
            <Button onClick={handleClick}>{row.user ? 'See student' : 'Activation link'}</Button>
          </ChakraFlex>
        );
      }
    }
  ];

  const prepareTableData = useCallback(() => {
    if (!businessLicensesQuery.data) return [];

    const licensesUsers = businessLicensesQuery.data
      ?.filter((license: License) => license.user?.id !== user.uid)
      .map((license: License) => {
        if (!license) return null;
        return {
          license
        };
      });

    return sortBy(licensesUsers, 'license.status');
  }, [businessLicensesQuery.data, businessUsersQuery.data]);
  const data = prepareTableData();

  return (
    <ChakraModal blockScrollOnMount={isOpen} isOpen={isOpen} isCentered onClose={onClose} size="5xl">
      <ChakraModalOverlay />
      <ChakraModalContent paddingX="xl" borderRadius="lg">
        <ChakraModalHeader paddingTop="xl">
          <ChakraFlex marginBottom="lg" justifyContent="space-between" alignItems="center">
            <ChakraFlex display="flex" alignItems="center">
              <ChakraHeading fontSize="2xl" color="blue.500">
                Licenses
              </ChakraHeading>
            </ChakraFlex>
            <Icon name="small-close" cursor="pointer" color="gray.500" onClick={onClose} />
          </ChakraFlex>
          <ChakraDivider borderColor="gray.500" />
        </ChakraModalHeader>
        <ChakraModalBody overflowY="auto" maxH="60vh" pb="5vh">
          {/* @ts-ignore */}
          <Table data={data} columns={tableColumns} />
        </ChakraModalBody>
      </ChakraModalContent>
    </ChakraModal>
  );
};
