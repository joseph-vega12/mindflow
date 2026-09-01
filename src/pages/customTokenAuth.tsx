import React, { FC, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, Progress, Text } from '@chakra-ui/react';
import { signInWithCustomToken } from 'firebase/auth';
import axios from 'axios';

import { Icon } from 'components/common';
import { auth } from 'lib/firebase/firebaseInit';
import { useRandomImage } from 'lib/firebase';

const isDev = process.env.NODE_ENV === 'development';

export const CustomTokenAuth: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');
  const [imageUrl] = useRandomImage();
  const [error, setError] = useState<string | null>(null);
  const hasSignedInRef = useRef(false);

  useEffect(() => {
    if (hasSignedInRef.current) {
      return;
    }

    const signIn = async () => {
      if (token) {
        hasSignedInRef.current = true;
        await signInWithCustomToken(auth, token);
        navigate('/', { replace: true });
        return;
      }

      if (isDev && uid) {
        const functionsUrl = process.env.REACT_APP_CLOUD_FUNCTIONS_URL;
        if (!functionsUrl) {
          setError('REACT_APP_CLOUD_FUNCTIONS_URL is not configured for local testing.');
          return;
        }

        hasSignedInRef.current = true;
        const res = await axios.post<{ customToken?: string }>(`${functionsUrl}/createDevCustomToken`, { uid });
        const customToken = res.data?.customToken;

        if (!customToken || typeof customToken !== 'string') {
          throw new Error('Custom token was not returned');
        }

        await signInWithCustomToken(auth, customToken);
        navigate('/', { replace: true });
        return;
      }

      if (uid && !isDev) {
        setError('UID-based sign-in is only available in local development.');
        return;
      }

      setError('Missing sign-in token. Use ?token=... or, in development, ?uid=... with the Functions emulator.');
    };

    signIn().catch((err) => {
      console.error('Custom token sign-in failed', err);
      setError('Sign-in failed. Please try again.');
    });
  }, [token, uid, navigate]);

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
        <Box py={16} px={10}>
          <Box mb={4}>
            <Icon name="mind-flow-full-logo" height="50px" width="100%" />
          </Box>

          <Box mt={12}>
            {error ? (
              <Text textAlign="center" color="red.500" fontSize="sm">
                {error}
              </Text>
            ) : (
              <>
                <Flex justifyContent="center">
                  <Progress size="sm" borderRadius={5} width="80%" colorScheme="blue" isIndeterminate />
                </Flex>
                <Text mt={4} textAlign="center" color="gray.600" fontSize="sm">
                  Signing you in...
                </Text>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};
