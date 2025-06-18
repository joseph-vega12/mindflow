import React, { FC, FormEvent, useState } from 'react';
import { Box, Button, Flex, FormLabel, Heading, Input } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';

import { Icon } from 'components/common';
import { useRandomImage } from 'lib/firebase';
import axios from 'axios';

interface Props { }

export const ResetPassword: FC<Props> = ({ }) => {
  const [newPassword, setNewPassword] = useState('');

  const [imageUrl] = useRandomImage();

  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();

  const sendResetPasswordMutation = useMutation(
    ['sendResetPassword'],
    async (ev: FormEvent) => {
      ev.preventDefault();

      const resp = await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/resetPassword`, {
        code,
        password: newPassword
      });

      return resp.data;
    },
    {
      onSuccess() {
        toast.success('Your password has been reset');
        navigate('/login');
      },
      onError(err) {
        console.error('err', err);
        toast.error('Email not found');
      }
    }
  );

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
        <form onSubmit={sendResetPasswordMutation.mutate}>
          <Box py={16} px={10}>
            <Box mb={4}>
              <Icon name="mind-flow-full-logo" height="50px" width="100%" />
            </Box>

            <Heading my={3} fontSize="2xl">
              Reset Password
            </Heading>

            <Box>
              <Box>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={newPassword}
                  onChange={(ev) => setNewPassword(ev.target.value)}
                />
              </Box>
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
            <Button px={6} colorScheme="blue" size="sm" type="submit">
              Reset Password
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};
