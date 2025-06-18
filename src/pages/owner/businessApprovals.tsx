import React, { FC, useMemo, useState } from 'react';

import {
  Flex as ChakraFlex,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputLeftAddon as ChakraInputLeftAddon,
  InputRightElement as ChakraInputRightElement,
  Select as ChakraSelect
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from 'react-query';

import { Icon } from 'components/common';

import { BusinessApproval, BusinessApprovalDocumentWithId, BusinessApprovalStatus } from 'types';

import { BusinessApprovalsPanelListing } from 'components/Pages/Owner/OwnerBusinessApprovalsPanel';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const OwnerBusinessApprovalsPanel: FC = () => {
  const form = useFormContext();
  const values = form.watch();

  const businessStatuses = [
    BusinessApprovalStatus.PENDING_APPROVAL,
    BusinessApprovalStatus.APPROVED,
    BusinessApprovalStatus.REJECTED
  ];
  const [searchInput, setSearchInput] = useState('');
  const businessApprovalsQuery = useQuery(
    ['query:business-approvals', values.status],
    async () => {
      if (values.status) {
        const businessApprovalsSnap = query(
          collection(db, 'businessApprovals')
            .withConverter<BusinessApprovalDocumentWithId>({
              fromFirestore: (doc) => ({ id: doc.id, ...(doc.data() as BusinessApproval) }),
              toFirestore: (doc: BusinessApprovalDocumentWithId) => doc
            }),
          where('status', '==', values.status),
          limit(200)
        )

        const businessApprovalDocs = await getDocs(businessApprovalsSnap)
        const businessApprovals = businessApprovalDocs.docs.map((d) => d.data());

        return businessApprovals;
      }
      const businessApprovalsSnap = query(
        collection(db, 'businessApprovals')
          .withConverter<BusinessApprovalDocumentWithId>({
            fromFirestore: (doc) => ({ id: doc.id, ...(doc.data() as BusinessApproval) }),
            toFirestore: (doc: BusinessApprovalDocumentWithId) => doc
          }), limit(200)
      )

      const businessApprovalDocs = await getDocs(businessApprovalsSnap)
      const businessApprovals = businessApprovalDocs.docs.map((d) => d.data());

      return businessApprovals;
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false
    }
  );

  const getFilteredBusinessApprovals = useMemo(
    () =>
      businessApprovalsQuery.data?.filter(
        (business) =>
          business?.name?.toLocaleLowerCase().match(searchInput.toLocaleLowerCase()) ||
          business?.email?.toLocaleLowerCase().match(searchInput.toLocaleLowerCase())
      ),
    [businessApprovalsQuery.data, searchInput]
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
        <ChakraInputGroup>
          <ChakraInputLeftAddon
            width="112px"
            color="white"
            fontWeight="normal"
            background="gray.500"
            borderLeftRadius="sm"
          >
            Status
          </ChakraInputLeftAddon>
          <ChakraSelect width="30%" borderLeftRadius="none" borderRightRadius="sm" name="status" {...form.register('status', { required: true })}>
            <option value="">No Filter</option>
            {businessStatuses.map((value, idx) => (
              <option value={value} key={idx}>
                {value}
              </option>
            ))}
          </ChakraSelect>
        </ChakraInputGroup>
      </ChakraFlex>
      <BusinessApprovalsPanelListing
        data={getFilteredBusinessApprovals ?? []}
        isLoading={businessApprovalsQuery.isLoading}
        refetch={businessApprovalsQuery.refetch}
      />
    </ChakraFlex>
  );
};
