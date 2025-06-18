import Joi from 'joi';
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

import { Essay, EssayDocumentWithId } from 'types';

import { EssaysPanelModalForm } from './EssaysPanelModalForm';
import { EssaysPanelModalQuestions } from './EssaysPanelModalQuestions';
import { addDoc, collection, deleteDoc, doc, updateDoc, WithFieldValue } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

interface EssaysPanelModalProps {
  editedEssay?: EssayDocumentWithId;
  isOpen: boolean;
  onClose: () => void;
}

const essaySubmitSchema = Joi.object({
  id: Joi.string(),
  name: Joi.string().required(),
  author: Joi.string().required(),
  category: Joi.string().required(),
  content: Joi.string(),
  textHtml: Joi.string(),
  questions: Joi.array().items({
    correctAnswer: Joi.string().required(),
    label: Joi.string().required(),
    options: Joi.object({
      a: Joi.string().required(),
      b: Joi.string().required(),
      c: Joi.string().required(),
      d: Joi.string().required()
    })
  })
}).required();

export const EssaysPanelModal: FC<EssaysPanelModalProps> = ({ editedEssay, isOpen, onClose }) => {

  const methods = useForm<EssayDocumentWithId>({
    defaultValues: {
      id: editedEssay?.id,
      name: editedEssay?.name,
      author: editedEssay?.author,
      category: 'adult',
      textHtml: editedEssay?.textHtml,
      content: editedEssay?.content,
      questions: editedEssay?.questions
    }
  });

  const formValues = methods.watch();
  const isEditMode = useMemo(() => !!editedEssay, [editedEssay]);
  const createOrUpdateEssayMutation = useMutation(
    async () => {
      const parsedEssay: Essay = {
        ...formValues,
        totalOfSentences: formValues.content
          .replace(/[\u0001]/gi, ' ')
          .split(' ')
          .filter((s) => s).length
      };


      const essayRef = collection(db, 'essays')
      const { id, ...dataToSave } = parsedEssay;

      if (isEditMode) {
        await updateDoc(doc(essayRef, editedEssay.id), dataToSave);
      } else {
        await addDoc(essayRef, dataToSave);
      }
    },
    {
      onSuccess: () => {
        if (isEditMode) toast.success('Essay updated successfully');
        else toast.success('Essay created successfully');

        onClose();
      }
    }
  );
  const deleteEssayMutation = useMutation(
    async () => {
      await deleteDoc(doc(db, 'essays', editedEssay.id));
    },
    {
      onSuccess: () => {
        toast.success('Essay deleted successfully');

        onClose();
      }
    }
  );

  const isFormValid = () => {
    const result = essaySubmitSchema.validate(formValues, { abortEarly: true });
    if (result.error) {
      return toast.error(result.error.message);
    }
    return createOrUpdateEssayMutation.mutate();
  };

  return (
    <ChakraModal isCentered size="lg" scrollBehavior="inside" isOpen={isOpen} onClose={() => onClose()}>
      <ChakraModalOverlay />
      <ChakraModalContent borderRadius="sm">
        <ChakraModalHeader borderBottom="sm" borderBottomColor="gray.300">
          {isEditMode ? 'Edit Essay' : 'Create New Essay'}
        </ChakraModalHeader>
        <ChakraModalCloseButton top="12px" borderRadius="sm" />

        <ChakraModalBody paddingY="lg">
          <ChakraFlex width="100%" height="100%" flexDirection="column">
            <FormProvider {...methods}>
              <EssaysPanelModalForm />
              <EssaysPanelModalQuestions />
            </FormProvider>
          </ChakraFlex>
        </ChakraModalBody>

        <ChakraModalFooter borderTop="sm" borderTopColor="gray.300" justifyContent="space-between">
          <ChakraText cursor="pointer" colorScheme="blue" marginRight="lg" onClick={() => onClose()}>
            Close
          </ChakraText>
          <ChakraFlex>
            {isEditMode && (
              <ChakraButton
                marginRight="sm"
                colorScheme="red"
                borderRadius="sm"
                variantColor="red"
                isDisabled={createOrUpdateEssayMutation.isLoading}
                isLoading={deleteEssayMutation.isLoading}
                onClick={() => deleteEssayMutation.mutate()}
              >
                Delete Essay
              </ChakraButton>
            )}
            <ChakraButton
              borderRadius="sm"
              colorScheme="blue"
              variantColor="blue"
              isLoading={createOrUpdateEssayMutation.isLoading}
              onClick={() => isFormValid()}
            >
              {isEditMode ? 'Update Essay' : 'Create Essay'}
            </ChakraButton>
          </ChakraFlex>
        </ChakraModalFooter>
      </ChakraModalContent>
    </ChakraModal>
  );
};
