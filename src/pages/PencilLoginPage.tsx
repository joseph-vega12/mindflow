import { Box, Button, Divider, Flex, FormLabel, Heading, Input, Text, Image } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import React, { FC, useState } from 'react';

import { Icon } from 'components/common';
import { useAuthContext } from 'lib/firebase';
import { useRandomImage } from 'lib/firebase';
import mindflowLogin from 'assets/images/mindflowLogin.png';
import pencilSpacesLogo from 'assets/images/pencilSpacesLogo.png';
import { Link as ReactRouterLink } from 'react-router-dom';

import axios from 'axios';

interface Props { }

type FormValues = {
  email: string;
  password: string;
};

export const PencilLoginPage: FC<Props> = ({ }) => {
  const { register, handleSubmit } = useForm<FormValues>();
  const { signIn, sendPasswordResetEmail } = useAuthContext();

  const [mode, setMode] = useState<'pencilSpacesLogin' | 'resetPassword'>('pencilSpacesLogin');
  const [imageUrl] = useRandomImage();

  const sigInMutation = useMutation(
    ['login'],
    async ({ email, password }: { email: string; password: string }) => signIn(email, password),
    {
      onError(err) {
        console.error('err', err);
        toast.error('Wrong email or password');
      }
    }
  );

  const sendResetPasswordMutation = useMutation(
    ['sendResetPassword'],
    async ({ email }: any) => {
      const resp = await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/forgotPassword`, {
        email
      });

      return resp.data;
    },
    {
      onSuccess() {
        toast.success('An email was sent to you');
        setMode('pencilSpacesLogin');
      },
      onError(err) {
        console.error('err', err);
        toast.error('Email not found');
      }
    }
  );

  const onSubmit = (fields: FormValues) => {
    if (mode === 'pencilSpacesLogin') {
      return sigInMutation.mutate(fields);
    }

    return sendResetPasswordMutation.mutate(fields);
  };

  return (
    <Flex
      minH="100vh"
      minW="100vw"
      justifyContent="center"
      alignItems="center"
      bg="linear-gradient(to right, #2c3e50, #bdc3c7)"
      bgImage={imageUrl ? `url(${imageUrl})` : ''}
      bgSize="100%"
    >
      <Flex boxShadow="lg" borderRadius="lg" bgColor="white" width="45%" minWidth="850px">
        <Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box py={16} px={10}>
              <Box mb={4}>
                <Icon name="mind-flow-full-logo-desc" height="75px" width="100%" />
              </Box>

              <Box mt={45}>
                <Box>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" name="email" {...register("email")} />
                </Box>

                {mode === 'pencilSpacesLogin' && (
                  <Box mt={17}>
                    <Box>
                      <FormLabel>Password</FormLabel>
                      <Input type="password" name="password" {...register("password")} />
                    </Box>
                  </Box>
                )}
              </Box>
              <Button
                px={6}
                mt={41}
                mb={18}
                colorScheme="blue"
                size="sm"
                width="100%"
                type="submit"
                disabled={sigInMutation.isLoading || sendResetPasswordMutation.isLoading}
              >
                {mode === 'pencilSpacesLogin' ? 'Login' : 'Reset Password'}
              </Button>
              {mode === 'pencilSpacesLogin' && (
                <Text color="gray.500" fontSize="sm" cursor="pointer" onClick={() => setMode('resetPassword')}>
                  Forgot your password?
                </Text>
              )}

              {mode === 'resetPassword' && (
                <Text color="gray.500" fontSize="sm" cursor="pointer" onClick={() => setMode('pencilSpacesLogin')}>
                  Already has an account?
                </Text>
              )}
            </Box>
          </form>
        </Box>
        <Box py={16}>
          <Divider orientation="vertical" h="380px" borderColor="#05314A" borderWidth="2px" opacity="1" />
        </Box>
        <Box py={16} px={10} position="relative">
          <Image position="absolute" right="40px" top="20px" src={pencilSpacesLogo} alt="" />
          <Image src={mindflowLogin} alt="" />
          <Box position="absolute" top="185px" left="125px">
            <Button
              as="a"
              href="https://mindflowspeedreading.com"
              target="_blank"
              colorScheme="blue"
              bg="rgba(148, 212, 214, 0.2)"
              color="white"
              size="md"
              border="1px solid rgba(148, 212, 214, 1)"
              fontSize={18}
              leftIcon={<Icon name="mindflow-logo-simple" />}
            >
              MindFlow Website
            </Button>

            <Button
              as={ReactRouterLink}
              to={'/free/program'}
              mt={41}
              colorScheme="green"
              color="#05314A"
              size="md"
              fontSize={18}
              leftIcon={<Icon name="invite" />}
            >
              Create an Account
            </Button>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};
