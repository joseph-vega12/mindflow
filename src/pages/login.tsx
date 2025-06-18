import React, { FC, useState } from 'react';
import { Box, Button, Flex, FormLabel, Heading, Input, Text } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import { Icon } from 'components/common';
import { useAuthContext } from 'lib/firebase';
import { useRandomImage } from 'lib/firebase';
import axios from 'axios';

interface Props { }

type FormValues = {
  email: string;
  password: string;
};

export const LoginPage: FC<Props> = ({ }) => {
  const { register, handleSubmit } = useForm<FormValues>();
  const { signIn, sendPasswordResetEmail } = useAuthContext();
  const navigate = useNavigate();  // Initialize navigate
  const [mode, setMode] = useState<'login' | 'resetPassword'>('login');
  const [imageUrl] = useRandomImage();

  const sigInMutation = useMutation(
    ['login'],
    async ({ email, password }: { email: string; password: string }) => signIn(email, password),
    {
      onSuccess() {
        toast.success('Login successful');
        navigate('/');
      },
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
        setMode('login');
      },
      onError(err) {
        console.error('err', err);
        toast.error('Email not found');
      }
    }
  );

  const onSubmit = (fields: FormValues) => {
    if (mode === 'login') {
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
      <Box boxShadow="lg" borderRadius="lg" bgColor="white">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box py={16} px={10}>
            <Box mb={4}>
              <Icon name="mind-flow-full-logo" height="50px" width="100%" />
            </Box>

            <Heading my={3} fontSize="2xl">
              {mode === 'login' ? 'Log in' : 'Reset Password'}
            </Heading>

            <Box>
              <Box>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" {...register("email")} />
              </Box>

              {mode === 'login' && (
                <Box>
                  <Box>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" name="password" {...register("password")} />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Flex
            py={4}
            px={10}
            borderTop="sm"
            borderColor="gray.300"
            borderBottomRadius="lg"
            bgColor="gray.100"
            justifyContent="space-between"
            alignItems="center"
          >
            {mode === 'login' && (
              <Text color="gray.600" fontSize="sm" cursor="pointer" onClick={() => setMode('resetPassword')}>
                Forgot your password?
              </Text>
            )}

            {mode === 'resetPassword' && (
              <Text color="gray.600" fontSize="sm" cursor="pointer" onClick={() => setMode('login')}>
                Already has an account?
              </Text>
            )}

            <Button
              px={6}
              colorScheme="blue"
              size="sm"
              type="submit"
              disabled={sigInMutation.isLoading || sendResetPasswordMutation.isLoading}
            >
              {mode === 'login' ? 'Login' : 'Reset Password'}
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};
