import React, { FC } from 'react';
import axios from 'axios';

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Flex } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from 'react-query';

import { ActivateLicenseForm } from 'components/Pages/Generic';
import { useRandomImage } from 'lib/firebase';
import { UserDetails } from 'types';

export const ActivateExistingLicense: FC = () => {
  const auth = getAuth()

  const { licenseId } = useParams<{ licenseId: string }>();
  const navigate = useNavigate();

  const { mutate: activateLicense, isLoading } = useMutation<any>(
    ['activateLicense'],
    // @ts-ignore
    async (values: Record<string, any>) => {
      await axios.post<UserDetails>(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/activateExistingLicense`, {
        user: values.user,
        password: values.password,
        licenseId
      });

      await signInWithEmailAndPassword(auth, values.user.email, values.password);
      toast.success('Welcome to MindFlow');
      navigate('/');
    },
    {
      onError(e) {
        // @ts-ignore
        toast.error(e?.response?.data?.message ?? 'Unknown error');
      }
    }
  );

  const [imageUrl] = useRandomImage();

  const onSubmit = (fields: any) => {
    activateLicense(fields);
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
      <ActivateLicenseForm isLoading={isLoading} onSubmit={onSubmit} />
    </Flex>
  );
};
