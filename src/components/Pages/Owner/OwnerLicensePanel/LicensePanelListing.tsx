import React, { FC, useMemo } from 'react';

import { Flex as ChakraFlex, Text as ChakraText, Tooltip as ChakraTooltip } from '@chakra-ui/react';

import { formatTimestamp } from 'lib/utils';
import { LicenseDocumentWithId } from 'types';

import { Icon, Table } from 'components/common';
import { useNavigate } from 'react-router-dom';

interface LicensePanelListingProps {
  data: LicenseDocumentWithId[];
  isLoading: boolean;
  onEditLicense: (license: LicenseDocumentWithId) => void;
  onSelectedRows: (rows: LicenseDocumentWithId[]) => void;
}

export const LicensePanelListing: FC<LicensePanelListingProps> = ({
  data,
  isLoading,
  onEditLicense,
  onSelectedRows
}) => {
  const navigate = useNavigate();

  const getLicenseStatusColor = (status: LicenseDocumentWithId['status']): string =>
  ({
    ACTIVE: 'green.500',
    INACTIVE: 'gray.500',
    EXPIRED: 'red.500'
  }[status]);

  const getTableColumns = useMemo(() => {
    return [
      {
        width: '20%',
        Header: 'Student',
        accessor: (row: LicenseDocumentWithId) => (row.user ? `${row?.user?.firstName} ${row?.user?.lastName}` : '-')
      },
      { width: '20%', Header: 'Duration Days', accessor: (row: LicenseDocumentWithId) => `${row.durationDays} days` },
      {
        width: '20%',
        Header: 'Activation Date',
        accessor: (row: LicenseDocumentWithId) => (row.activationDate ? formatTimestamp(row?.activationDate) : '-')
      },
      {
        width: '20%',
        Header: 'Expiration Date',
        accessor: (row: LicenseDocumentWithId) => (row.expirationDate ? formatTimestamp(row?.expirationDate) : '-')
      },
      {
        width: '20%',
        Header: 'License Status',
        accessor: (row: LicenseDocumentWithId) => (
          <ChakraText fontWeight="normal" color={getLicenseStatusColor(row.status)}>
            {row.status}
          </ChakraText>
        )
      },
      {
        width: '20%',
        Header: 'Actions',
        accessor: (row: LicenseDocumentWithId) => (
          <ChakraFlex justifyContent="center">
            <ChakraTooltip hasArrow label="Edit license">
              <Icon
                name="edit"
                color="gray.500"
                marginRight="sm"
                transitionDuration="0.3s"
                _hover={{
                  color: 'orange.500'
                }}
                onClick={() => onEditLicense(row)}
              />
            </ChakraTooltip>
            <ChakraTooltip hasArrow label="Check user">
              <Icon
                name="user"
                color="green.500"
                transitionDuration="0.3s"
                onClick={() => {
                  navigate('/owner/students/' + row.user?.id);
                  // return row.user?.id ? router.push('/owner/students/' + row.user?.id) : toast.warn('This license does not have any student')
                }}
              />
            </ChakraTooltip>
          </ChakraFlex>
        )
      }
    ];
  }, [data]);

  return (
    <Table
      isPageable={true}
      isLoading={isLoading}
      columns={getTableColumns}
      data={data}
      isSelectable={true}
      onSelectRows={(rows) => onSelectedRows((rows as unknown) as LicenseDocumentWithId[])}
    />
  );
};
