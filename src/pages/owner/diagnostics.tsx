import React, { FC, useMemo, useState } from 'react';

import {
  Flex as ChakraFlex,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement,
  useDisclosure
} from '@chakra-ui/react';
import { useQuery } from 'react-query';

import { Icon } from 'components/common';
import { Diagnostic, DiagnosticDocumentWithId } from 'types';

import { DiagnosticsPanelListing, DiagnosticsPanelModal } from 'components/Pages/Owner/OwnerDiagnosticsPanel';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const OwnerDiagnosticsPanel: FC = () => {
  const modalDisclosure = useDisclosure();

  const [searchInput, setSearchInput] = useState('');
  const [editedDiagnostic, setEditedDiagnostic] = useState<DiagnosticDocumentWithId>();

  const diagnosticsQuery = useQuery(['query:diagnostics'], async () => {
    const diagnosticsSnap = query(
      collection(db, 'diagnostics')
        .withConverter<Diagnostic>({
          fromFirestore: (doc) => ({ id: doc.id, ...(doc.data() as Diagnostic) }),
          toFirestore: (doc: Diagnostic) => doc
        }), orderBy('category', 'asc'), orderBy('order', 'asc'), limit(200)
    )

    const diagnosticDocs = await getDocs(diagnosticsSnap)

    const diagnostics = diagnosticDocs.docs.map((d) => d.data());

    return diagnostics;
  });

  const getFilteredDiagnostics = useMemo(
    () =>
      diagnosticsQuery.data?.filter(
        (diagnostic) =>
          diagnostic?.name?.toLocaleLowerCase().match(searchInput.toLowerCase()) ||
          diagnostic?.category?.toLowerCase().match(searchInput.toLowerCase()) ||
          diagnostic?.author?.toLowerCase().match(searchInput.toLowerCase())
      ) ?? [],
    [diagnosticsQuery.data, searchInput]
  );

  const handleModalClose = () => {
    setEditedDiagnostic(undefined);
    diagnosticsQuery.refetch();
    modalDisclosure.onClose();
  };

  const handleEditModal = (diagnostic: DiagnosticDocumentWithId) => {
    setEditedDiagnostic(diagnostic);
    modalDisclosure.onOpen();
  };

  return (
    <ChakraFlex flexDirection="column">
      <ChakraFlex marginBottom="md" justifyContent="space-between" alignItems="center">
        <ChakraInputGroup width="340px">
          <ChakraInput
            placeholder="Search Diagnostics"
            borderRadius="sm"
            value={searchInput}
            onChange={({ target }) => setSearchInput(target.value)}
          />
          <ChakraInputRightElement>
            <Icon size="sm" borderColor="gray.500" name="search" />
          </ChakraInputRightElement>
        </ChakraInputGroup>
      </ChakraFlex>
      {modalDisclosure.isOpen && (
        <DiagnosticsPanelModal
          isOpen={modalDisclosure.isOpen}
          editedDiagnostic={editedDiagnostic}
          onClose={() => handleModalClose()}
        />
      )}
      <DiagnosticsPanelListing
        data={getFilteredDiagnostics}
        isLoading={diagnosticsQuery.isLoading}
        onEdit={(diagnostic) => handleEditModal(diagnostic)}
      />
    </ChakraFlex>
  );
};
