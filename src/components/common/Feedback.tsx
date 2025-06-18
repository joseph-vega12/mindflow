import React, { FC, useMemo, useState } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Input as ChakraInput,
  Text as ChakraText,
  Textarea as ChakraTextarea,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

import { useAuthContext } from 'lib/firebase';

import { Icon } from './Icon';

interface FeedbackForm {
  title: string;
  description: string;
}

export const Feedback: FC = () => {
  const toast = useToast();
  const feedbackDisclosure = useDisclosure();

  const [isLoading, setIsLoading] = useState(false);

  const { watch, register, reset } = useForm<FeedbackForm>();
  const {
    user: { email }
  } = useAuthContext();

  const values = watch();

  const isFormValid = useMemo(() => !!(values.title && values.description), [values]);

  const handleFeedbackToggle = () => {
    feedbackDisclosure.onToggle();
    reset({});
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const { title, description } = values;

    await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/sendFeedback`, {
      email,
      title,
      description
    });

    setIsLoading(false);

    toast({
      status: 'success',
      title: 'Feedback sent',
      description: 'Thank you for your feedback'
    });

    handleFeedbackToggle();
  };

  return (
    <ChakraFlex position="absolute" bottom="8" right="8" flexDirection="column" alignItems="flex-end">
      {feedbackDisclosure.isOpen && (
        <ChakraFlex
          width="400px"
          border="sm"
          padding="lg"
          borderColor="gray.300"
          borderRadius="md"
          marginBottom="md"
          flexDirection="column"
          backgroundColor="white"
          boxShadow="large"
        >
          <ChakraHeading fontSize="xl" marginBottom="sm" color="blue.500">
            Send a feedback
          </ChakraHeading>

          <ChakraText marginBottom="md" color="gray.500">
            Be free to send us a feedback. That way we can continue improving the platform.
          </ChakraText>

          <ChakraFlex flexDirection="column" marginBottom="md">
            <ChakraText marginBottom="sm" fontSize="md" color="blue.500">
              Title
            </ChakraText>
            <ChakraInput required name="title" {...register("title")} />
          </ChakraFlex>

          <ChakraFlex flexDirection="column" marginBottom="lg">
            <ChakraText marginBottom="sm" fontSize="md" color="blue.500">
              Description
            </ChakraText>
            <ChakraTextarea required name="description" {...register("description")} />
          </ChakraFlex>

          <ChakraFlex alignItems="center" justifyContent="flex-end">
            <ChakraButton colorScheme="gray" marginRight="md" onClick={() => handleFeedbackToggle()}>
              Cancel
            </ChakraButton>

            <ChakraButton
              colorScheme="blue"
              isLoading={isLoading}
              isDisabled={!isFormValid}
              onClick={() => handleSubmit()}
            >
              Submit
            </ChakraButton>
          </ChakraFlex>
        </ChakraFlex>
      )}

      <ChakraFlex
        width="fit-content"
        cursor="pointer"
        padding="md"
        alignItems="center"
        borderRadius="sm"
        justifyContent="center"
        backgroundColor="blue.500"
        onClick={() => handleFeedbackToggle()}
      >
        <Icon name="flag" color="white" />
      </ChakraFlex>
    </ChakraFlex>
  );
};
