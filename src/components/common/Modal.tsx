import {
  Button as ChakraButton,
  Modal as ChakraModal,
  ModalBody as ChakraModalBody,
  ModalCloseButton as ChakraModalCloseButton,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalHeader as ChakraModalHeader,
  ModalOverlay as ChakraModalOverlay,
  ModalProps as ChakraModalProps,
  Text as ChakraText
} from '@chakra-ui/react';
import React, { FC } from 'react';

interface ModalProps extends ChakraModalProps {
  title: string;
  subTitle?: string;
  onClose: () => void;
  onConfirm?: () => void;
  showHeader?: boolean;
  showFooter?: boolean;
  isOpen: boolean;
}

export const Modal: FC<ModalProps> = ({
  title,
  subTitle,
  children,
  isOpen,
  onClose,
  onConfirm = console.warn,
  showHeader = true,
  showFooter = false,
  ...rest
}) => {
  return (
    <ChakraModal size="xl" isOpen={isOpen} onClose={onClose} {...rest}>
      <ChakraModalOverlay />
      <ChakraModalContent>
        {showHeader && (
          <ChakraModalHeader>
            {title}
            {subTitle && (
              <ChakraText color="gray.500" marginBottom="sm">
                {subTitle}
              </ChakraText>
            )}
            <ChakraModalCloseButton />
          </ChakraModalHeader>
        )}
        <ChakraModalBody pb="md">{children}</ChakraModalBody>
        {showFooter && (
          <ChakraModalFooter borderTop="sm" borderTopColor="ui.200">
            <ChakraButton marginRight="md" variant="secondary" onClick={onClose}>
              Cancel
            </ChakraButton>
            <ChakraButton onClick={onConfirm}>Confirm</ChakraButton>
          </ChakraModalFooter>
        )}
      </ChakraModalContent>
    </ChakraModal>
  );
};
