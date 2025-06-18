import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react';
import React, { FC } from 'react';

export interface Props {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmation: () => void;
}

export const DiagnosticConfirmationModal: FC<Props> = ({ title, isOpen, onClose, onConfirmation }) => {
  return (
    <Modal blockScrollOnMount={false} isOpen={isOpen} isCentered onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="sm">
        <ModalHeader color="blue.500" fontWeight="bold" borderBottom="sm" borderBottomColor="gray.300">
          {title}
        </ModalHeader>
        <ModalCloseButton
          color="gray.500"
          cursor="pointer"
          boxShadow="0"
          marginTop="sm"
          borderRadius="sm"
          background="transparent"
          onClick={() => onClose()}
        />
        <ModalBody>
          <Text color="gray.600">
            You'll only be able to take each diagnostic once and you will only have{' '}
            <Text as="span" fontWeight="bold">
              12 minutes
            </Text>{' '}
            to complete this exercise.
          </Text>
        </ModalBody>
        <ModalFooter borderTop="sm" borderTopColor="gray.300">
          <Button borderRadius="sm" marginRight="sm" colorScheme="gray" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button borderRadius="sm" colorScheme="blue" onClick={onConfirmation}>
            Proceed to Test
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
