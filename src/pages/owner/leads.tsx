import React, { FC, useMemo, useState } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement,
  Text as ChakraText
} from '@chakra-ui/react';
import { useQuery } from 'react-query';

import { Icon } from 'components/common';
import { Lead, LeadDocumentWithId } from 'types';

import { LeadsPanelListing } from 'components/Pages/Owner/OwnerLeadsPanel';
import moment from 'moment';
import { collection, getDocs, orderBy, query, doc, writeBatch } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const OwnerLeadsPanel: FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<LeadDocumentWithId[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const leadsQuery = useQuery(
    ['query:leads'],
    async () => {
      const leadsSnap = query(
        collection(db, 'leads')
          .withConverter<LeadDocumentWithId>({
            toFirestore: (doc: LeadDocumentWithId) => doc,
            fromFirestore: (doc) => ({
              id: doc.id,
              ...(doc.data() as Lead)
            })
          }), orderBy('timestamp', 'desc'))

      const leadDocs = await getDocs(leadsSnap)

      const leads = leadDocs.docs.map((d) => d.data());

      return leads;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  const handleDeleteSelectedRows = async () => {
    setIsDeleting(true);

    const batch = writeBatch(db)

    selectedLeads.forEach((leadDoc) => {
      const reference = doc(collection(db, 'leads'), leadDoc.id);

      batch.delete(reference);
    });

    await batch.commit();

    leadsQuery.refetch();

    setSelectedLeads([]);
    setIsDeleting(false);
  };

  const handleUpdateArchiveStatus = () => {
    setIsUpdating(true);

    const batch = writeBatch

    selectedLeads.forEach((leadDoc) => {
      const reference = doc(collection(db, 'leads'), leadDoc.id);

      batch.update(reference, {
        archived: !showArchived,
      });
    });

    batch.commit();

    leadsQuery.refetch();

    setSelectedLeads([]);
    setIsUpdating(false);
  };

  const handleExportLeads = () => {
    const downloadFile = ({ data, fileName, fileType }) => {
      const blob = new Blob([data], { type: fileType });
      const linkElement = document.createElement('a');

      linkElement.download = fileName;
      linkElement.href = window.URL.createObjectURL(blob);

      const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      linkElement.dispatchEvent(clickEvt);
      linkElement.remove();
    };

    const headers = 'Id,Name,Email,Date,Result,Converted,Archived';

    const licensesCsv = leadsQuery.data.reduce((prev, lead) => {
      const { id, name, email, timestamp, result, converted, archived } = lead;

      const row = [
        id,
        name,
        email,
        moment(timestamp).format('MM/DD/YYYY'),
        result?.wordSpeed,
        converted || false,
        archived || false
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

  const getFilteredLeads = useMemo(() => {
    const startTimestamp = moment(startDate, 'YYYY-MM-DD').startOf('day').unix() * 1000;
    const endTimestamp = moment(endDate, 'YYYY-MM-DD').endOf('day').unix() * 1000;

    const filteredLeadsBySearch = leadsQuery.data?.filter(
      (lead) =>
        lead.name.toLocaleLowerCase().match(searchInput.toLowerCase()) ||
        lead.email.toLowerCase().match(searchInput.toLowerCase())
    );

    const filteredByStatus = filteredLeadsBySearch?.filter((lead) => (showArchived ? !!lead.archived : !lead.archived));
    const filteredByDate =
      startDate && endDate
        ? filteredByStatus?.filter((lead) => lead.timestamp >= startTimestamp && lead.timestamp <= endTimestamp)
        : filteredByStatus;

    return filteredByDate ?? [];
  }, [leadsQuery.data, searchInput, showArchived, startDate, endDate]);

  return (
    <ChakraFlex flexDirection="column">
      <ChakraText marginBottom="md" color="blue.500">
        Leads that came from the Free Test page
      </ChakraText>
      <ChakraFlex marginBottom="md" justifyContent="space-between" alignItems="center">
        <ChakraFlex alignItems="center">
          <ChakraInputGroup width="340px" marginRight="md">
            <ChakraInput
              placeholder="Search Lead"
              borderRadius="sm"
              value={searchInput}
              onChange={({ target }) => setSearchInput(target.value)}
            />
            <ChakraInputRightElement>
              <Icon size="sm" borderColor="gray.500" name="search" />
            </ChakraInputRightElement>
          </ChakraInputGroup>
          <ChakraFlex minWidth="0px">
            <ChakraInput
              type="date"
              name="startDate"
              placeholder="DD/MM/YYYY"
              borderRightRadius="none"
              borderRadius="sm"
              value={startDate}
              onChange={({ target }) => setStartDate(target.value)}
            />
            <ChakraInput
              type="date"
              marginRight="md"
              placeholder="DD/MM/YYYY"
              borderLeftRadius="none"
              borderRadius="sm"
              name="endDate"
              value={endDate}
              onChange={({ target }) => setEndDate(target.value)}
            />
            <ChakraButton colorScheme="green" onClick={() => handleExportLeads()}>
              <Icon name="export" />
            </ChakraButton>
          </ChakraFlex>
        </ChakraFlex>
        <ChakraFlex>
          <ChakraButton marginRight="md" onClick={() => setShowArchived(!showArchived)}>
            Show {showArchived ? 'unarchived' : 'archived'}
          </ChakraButton>
          <ChakraButton
            marginRight="md"
            colorScheme="blue"
            rightIcon={<Icon name="not-allowed" />}
            isLoading={isUpdating}
            isDisabled={!selectedLeads?.length}
            onClick={() => handleUpdateArchiveStatus()}
          >
            {showArchived ? 'Unarchive' : 'Archive'} ({selectedLeads?.length}) leads
          </ChakraButton>
          <ChakraButton
            colorScheme="red"
            rightIcon={<Icon name="not-allowed" />}
            isLoading={isDeleting}
            isDisabled={!selectedLeads?.length}
            onClick={() => handleDeleteSelectedRows()}
          >
            Delete ({selectedLeads?.length}) leads
          </ChakraButton>
        </ChakraFlex>
      </ChakraFlex>
      <LeadsPanelListing
        data={getFilteredLeads}
        isLoading={leadsQuery.isLoading}
        onSelectRows={(rows) => setSelectedLeads(rows)}
      />
    </ChakraFlex>
  );
};
