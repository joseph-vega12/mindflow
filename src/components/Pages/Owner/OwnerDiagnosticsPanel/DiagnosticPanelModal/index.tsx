import React, { FC, useMemo } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Modal as ChakraModal,
  ModalBody as ChakraModalBody,
  ModalCloseButton as ChakraModalCloseButton,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalHeader as ChakraModalHeader,
  ModalOverlay as ChakraModalOverlay,
  Text as ChakraText
} from '@chakra-ui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useMutation } from 'react-query';

import { Diagnostic, DiagnosticDocumentWithId } from 'types';

import { useFirebaseContext } from 'lib/firebase';

import { DiagnosticsPanelModalForm } from './DiagnosticsPanelModalForm';
import { DiagnosticsPanelModalQuestions } from './DiagnosticsPanelModalQuestions';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

interface DiagnosticsPanelModalProps {
  editedDiagnostic?: DiagnosticDocumentWithId;
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsPanelModal: FC<DiagnosticsPanelModalProps> = ({ editedDiagnostic, isOpen, onClose }) => {
  const { firestore } = useFirebaseContext();

  const methods = useForm<DiagnosticDocumentWithId>({
    defaultValues: editedDiagnostic || {
      id: '',
      name: '',
      title: '',
      author: '',
      source: '',
      category: 'gmat',
      text: '',
      content: '',
      difficult: 0,
      totalOfSentences: 0,
      questions: []
    }
  });

  const formValues = methods.watch();

  const isEditMode = useMemo(() => !!editedDiagnostic, [editedDiagnostic]);

  const createOrUpdateDiagnosticsMutation = useMutation(
    async () => {
      const parsedDiagnostic: Diagnostic = {
        ...formValues,
        totalOfSentences: formValues.content
          .replace(/[\u0001]/gi, ' ')
          .split(' ')
          .filter((s) => s).length
      };

      const diagnosticRef = collection(db, 'diagnostics')
      const { id, ...dataToSave } = parsedDiagnostic;

      if (isEditMode) {
        await updateDoc(doc(diagnosticRef, editedDiagnostic.id), dataToSave);
      } else {
        await addDoc(diagnosticRef, dataToSave)
      }
    },
    {
      onSuccess: () => {
        if (isEditMode) toast.success('Diagnostic updated successfully');
        else toast.success('Diagnostic created successfully');
        onClose();
      }
    }
  );

  const isFormValid = useMemo(() => {
    const { name, category, content, questions } = formValues;

    const isBasicFormValid = !!name && !!content && !!category && questions?.length > 0;
    const isQuestionsFormInvalid = questions?.some((question) => !question.label || !question.correctAnswer);
    return isBasicFormValid && !isQuestionsFormInvalid;
  }, [formValues]);

  return (
    <ChakraModal isCentered size="lg" scrollBehavior="inside" isOpen={isOpen} onClose={() => onClose()}>
      <ChakraModalOverlay />
      <ChakraModalContent borderRadius="sm">
        <ChakraModalHeader borderBottom="sm" borderBottomColor="gray.300">
          {isEditMode ? 'Edit Diagnostic' : 'Create New Diagnostic'}
        </ChakraModalHeader>
        <ChakraModalCloseButton top="12px" borderRadius="sm" />

        <ChakraModalBody paddingY="lg">
          <ChakraFlex width="100%" height="100%" flexDirection="column">
            <FormProvider {...methods}>
              <DiagnosticsPanelModalForm />
              <DiagnosticsPanelModalQuestions />
            </FormProvider>
          </ChakraFlex>
        </ChakraModalBody>

        <ChakraModalFooter borderTop="sm" borderTopColor="gray.300" justifyContent="space-between">
          <ChakraText cursor="pointer" colorScheme="blue" marginRight="lg" onClick={() => onClose()}>
            Close
          </ChakraText>
          <ChakraFlex>
            <ChakraButton
              borderRadius="sm"
              colorScheme="blue"
              variantColor="blue"
              isDisabled={!isFormValid}
              isLoading={createOrUpdateDiagnosticsMutation.isLoading}
              onClick={() => createOrUpdateDiagnosticsMutation.mutate()}
            >
              {isEditMode ? 'Update Diagnostic' : 'Create Diagnostic'}
            </ChakraButton>
          </ChakraFlex>
        </ChakraModalFooter>
      </ChakraModalContent>
    </ChakraModal>
  );
};
