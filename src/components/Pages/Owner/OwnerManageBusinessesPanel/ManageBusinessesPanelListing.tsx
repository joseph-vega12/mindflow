import React, { FC, useMemo } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Switch as ChakraSwitch,
  Tooltip as ChakraTooltip
} from '@chakra-ui/react';

import { Column } from 'react-table';
import { formatTimestamp } from 'lib/utils';

import { Icon, Table } from 'components/common';
import { useNavigate } from 'react-router-dom';

import { Business, BusinessDocumentWithId } from 'types';

interface BusinessesPanelListingProps {
  data?: BusinessDocumentWithId[];
  onEditBusiness: (business: Business) => void;
  onToggleSwitch: (business: Business) => void;
  isLoading?: boolean;
  refetch: () => void;
}

export const ManageBusinessPanelListing: FC<BusinessesPanelListingProps> = ({
  data,
  isLoading,
  onEditBusiness,
  onToggleSwitch
}) => {
  const navigate = useNavigate();

  const getTableColumns = useMemo<Column<BusinessDocumentWithId>[]>(() => {
    return [
      { width: '15%', Header: 'Business Name', accessor: 'business' },
      { width: '15%', Header: 'Name', accessor: 'name' },
      { width: '15%', Header: 'Email', accessor: 'email' },
      {
        width: '15%',
        Header: 'Phone',
        accessor: (row) => {
          return row.phone;
        }
      },
      {
        width: '15%',
        Header: 'Number of licenses',
        accessor: (row) => {
          return row.quantity;
        }
      },
      {
        width: '15%',
        Header: 'License Price',
        accessor: (row) => {
          return row.licensePrice ? `$${row.licensePrice}.00` : [];
        }
      },
      {
        width: '15%',
        Header: 'date',
        accessor: (row) => {
          return formatTimestamp(row.timestamp, 'MM/DD/YYYY');
        }
      },
      {
        id: 'action',
        width: '10%',
        Header: 'Options',
        accessor: (row) => {
          return (
            <ChakraFlex alignItems="center">
              <ChakraTooltip hasArrow label="Edit Business">
                <Icon
                  name="edit"
                  color="gray.500"
                  marginRight="sm"
                  transitionDuration="0.3s"
                  _hover={{
                    color: 'orange.500'
                  }}
                  onClick={() => {
                    onEditBusiness(row);
                  }}
                />
              </ChakraTooltip>
              <ChakraSwitch
                size="md"
                name="enableBuyButton"
                defaultChecked={row.isBuyingEnabled}
                onChange={() => {
                  onToggleSwitch(row);
                }}
              />
              <ChakraButton
                width="40px"
                height="40px"
                justifyContent="center"
                alignItems="center"
                borderRadius="full"
                color="white"
                boxShadow="base"
                background="green.500"
                ms={2}
                onClick={() => {
                  navigate(`/owner/businessDetails/${row.id}`); // Now using navigate directly
                }}
              >
                <Icon size="sm" name="analytics" />
              </ChakraButton>
            </ChakraFlex>
          );
        }
      }
    ];
  }, [data]);

  return <Table isPageable={true} isLoading={isLoading} columns={getTableColumns} data={data} />;
};
