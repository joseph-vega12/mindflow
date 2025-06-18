import React, { FC, useMemo, useState } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement,
  useDisclosure
} from '@chakra-ui/react';
import { useQuery } from 'react-query';

import { Icon } from 'components/common';
import { Essay, EssayDocumentWithId } from 'types';

import { EssaysPanelListing, EssaysPanelModal } from 'components/Pages/Owner/OwnerEssaysPanel';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const OwnerEssaysPanel: FC = () => {
  const modalDisclosure = useDisclosure();

  const [searchInput, setSearchInput] = useState('');
  const [editedEssay, setEditedEssay] = useState<EssayDocumentWithId>();

  const essaysQuery = useQuery(['query:essays'], async () => {
    const essaysSnap = query(
      collection(db, 'essays')
        .withConverter<EssayDocumentWithId>({
          fromFirestore: (doc) => ({ id: doc.id, ...(doc.data() as Essay) }),
          toFirestore: (doc: EssayDocumentWithId) => doc
        }), orderBy('name', 'asc'), limit(200)
    )

    const essayDocs = await getDocs(essaysSnap)
    const essays = essayDocs.docs.map((d) => d.data());

    return essays;
  });

  const getFilteredEssays = useMemo(
    () =>
      essaysQuery.data?.filter(
        (essay) =>
          essay?.name?.toLocaleLowerCase().match(searchInput.toLowerCase()) ||
          essay?.category?.toLowerCase().match(searchInput.toLowerCase()) ||
          essay?.author?.toLowerCase().match(searchInput.toLowerCase())
      ) ?? [],
    [essaysQuery.data, searchInput]
  );

  const handleModalClose = () => {
    setEditedEssay(undefined);
    essaysQuery.refetch();
    modalDisclosure.onClose();
  };

  const handleEditModal = (essay: EssayDocumentWithId) => {
    setEditedEssay(essay);
    modalDisclosure.onOpen();
  };

  return (
    <ChakraFlex flexDirection="column">
      <ChakraFlex marginBottom="md" justifyContent="space-between" alignItems="center">
        <ChakraInputGroup width="340px">
          <ChakraInput
            placeholder="Search Essays"
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
          colorScheme="blue"
          leftIcon={<Icon name="small-add" />}
          onClick={() => modalDisclosure.onOpen()}
        >
          Create new essay
        </ChakraButton>
      </ChakraFlex>
      {modalDisclosure.isOpen && (
        <EssaysPanelModal
          isOpen={modalDisclosure.isOpen}
          editedEssay={editedEssay}
          onClose={() => handleModalClose()}
        />
      )}
      <EssaysPanelListing
        data={getFilteredEssays}
        isLoading={essaysQuery.isLoading}
        onEdit={(essay) => handleEditModal(essay)}
      />
    </ChakraFlex>
  );
};
