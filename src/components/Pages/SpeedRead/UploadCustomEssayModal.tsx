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
  ModalOverlay as ChakraModalOverlay
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from 'react-query';
import React, { FC, useMemo, useState } from 'react';

import { CustomEssay } from 'types';
import { HtmlEditor } from 'components/common';
import { toast } from 'react-toastify';
import { useAuthContext, useFirebaseContext } from 'lib/firebase';

export interface Props {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const UploadCustomEssayModal: FC<Props> = ({ isOpen, onClose, onOpen }) => {
  const [customText, setCustomText] = useState<{
    name: string;
    author: string;
    source: string;
    content: string;
    textHtml: string;
  }>({
    name: '',
    author: '',
    source: '',
    content: '',
    textHtml: ''
  });

  const { user } = useAuthContext();
  const { firestore } = useFirebaseContext();
  const queryClient = useQueryClient();

  const { mutate: uploadCustomText, isLoading } = useMutation(
    async () => {
      const newCustomText: CustomEssay = {
        ...customText,
        totalOfSentences: customText.content
          .replace(/[\u0001]/gi, ' ')
          .split(' ')
          .filter((s) => s).length,
        userId: user?.uid ?? '',
        timestamp: +new Date()
      };

      await firestore.collection('customEssays').add(newCustomText);

      await queryClient.invalidateQueries('essays');
    },
    {
      onSuccess() {
        toast.success('Text uploaded successfully');
        onClose();
      }
    }
  );

  const isValidForm = useMemo(() => {
    return customText.name && customText.author && customText.source && customText.content;
  }, [customText]);

  return (
    <ChakraModal size="2xl" scrollBehavior="inside" isOpen={isOpen} isCentered onClose={onClose}>
      <ChakraModalOverlay />
      <ChakraModalContent borderRadius="sm">
        <ChakraModalHeader color="blue.500" borderBottom="sm" borderBottomColor="gray.300" fontWeight="bold">
          Upload your custom text
        </ChakraModalHeader>
        <ChakraModalCloseButton
          mt={1}
          background="transparent"
          border="none"
          outline="none"
          boxShadow="0"
          color="gray.500"
          cursor="pointer"
          onClick={onClose}
        />
        <ChakraModalBody py={6} overflow="auto">
          <ChakraFlex flexDirection="column">
            <ChakraFormLabel>Text Name</ChakraFormLabel>
            <ChakraInput
              borderRadius="sm"
              onChange={({ target }) =>
                setCustomText((previousState) => ({
                  ...previousState,
                  name: target.value
                }))
              }
            />
          </ChakraFlex>
          <ChakraFlex width="100%" my="md">
            <ChakraFlex width="100%" flexDirection="column" marginRight="md">
              <ChakraFormLabel>Text Author</ChakraFormLabel>
              <ChakraInput
                borderRadius="sm"
                onChange={({ target }) =>
                  setCustomText((previousState) => ({
                    ...previousState,
                    author: target.value
                  }))
                }
              />
            </ChakraFlex>
            <ChakraFlex width="100%" flexDirection="column">
              <ChakraFormLabel>Text Source</ChakraFormLabel>
              <ChakraInput
                borderRadius="sm"
                onChange={({ target }) =>
                  setCustomText((previousState) => ({
                    ...previousState,
                    source: target.value
                  }))
                }
              />
            </ChakraFlex>
          </ChakraFlex>
          <ChakraFlex flexDirection="column">
            <ChakraFormLabel fontSize="md">Text</ChakraFormLabel>
            <HtmlEditor
              textHtml=""
              onChange={(textHtml, content) =>
                setCustomText((previousState) => ({
                  ...previousState,
                  textHtml,
                  content
                }))
              }
            />
          </ChakraFlex>
        </ChakraModalBody>
        <ChakraModalFooter borderTop="sm" borderTopColor="gray.300">
          <ChakraButton
            borderRadius="sm"
            colorScheme="blue"
            isDisabled={!isValidForm}
            isLoading={isLoading}
            onClick={() => uploadCustomText()}
          >
            Upload text
          </ChakraButton>
        </ChakraModalFooter>
      </ChakraModalContent>
    </ChakraModal>
  );
};
