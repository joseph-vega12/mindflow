import React, { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, Progress, Text } from '@chakra-ui/react';
import { onAuthStateChanged, signInWithCustomToken, User } from 'firebase/auth';

import { Icon } from 'components/common';
import { auth } from 'lib/firebase/firebaseInit';
import { useRandomImage } from 'lib/firebase';
import axios from 'axios';

const API_BASE = 'https://apiv2-my3sfr4paq-uc.a.run.app';

type CleverAuthResult = {
  customToken?: string;
  hasAvailableSeat?: boolean;
  message?: string;
};

/** One Clever code can only be exchanged once — share in-flight work across remounts. */
const exchangeByCode = new Map<string, Promise<CleverAuthResult>>();
/** Last successful response per code (survives a twin request failing after the first succeeded). */
const successfulResultByCode = new Map<string, CleverAuthResult>();

const NO_SEATS_MESSAGE = 'No available seats for your district. Please contact your school.';

function waitForAuthUser(timeoutMs = 2500): Promise<User | null> {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      unsubscribe();
      resolve(auth.currentUser);
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.clearTimeout(timer);
        unsubscribe();
        resolve(user);
      }
    });
  });
}

function isNoSeatsResult(data: CleverAuthResult | null | undefined): boolean {
  if (!data) return false;
  if (data.hasAvailableSeat === false) return true;
  if (typeof data.message === 'string' && data.message.toLowerCase().includes('no available seat')) {
    return true;
  }
  return false;
}

function exchangeCleverCode(code: string, redirectUri: string): Promise<CleverAuthResult> {
  const cachedSuccess = successfulResultByCode.get(code);
  if (cachedSuccess) {
    return Promise.resolve(cachedSuccess);
  }

  const existing = exchangeByCode.get(code);
  if (existing) {
    return existing;
  }

  // Register the promise before starting the request so remounts cannot open a second POST.
  let resolvePromise!: (value: CleverAuthResult) => void;
  let rejectPromise!: (reason?: unknown) => void;
  const request = new Promise<CleverAuthResult>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  exchangeByCode.set(code, request);

  axios
    .post(`${API_BASE}/oauthCleverAuth`, {
      code,
      redirect_uri: redirectUri
    })
    .then((res) => {
      const data = (res?.data ?? {}) as CleverAuthResult;
      successfulResultByCode.set(code, data);
      resolvePromise(data);
    })
    .catch((err) => {
      exchangeByCode.delete(code);
      rejectPromise(err);
    });

  return request;
}

function applyCleverAuthResult(
  data: CleverAuthResult,
  options: {
    cancelled: () => boolean;
    navigate: (path: string, opts: { replace: boolean }) => void;
    setError: (message: string | null) => void;
  }
) {
  const { cancelled, navigate, setError } = options;

  if (cancelled()) return;

  const customToken = data.customToken;

  if (customToken && typeof customToken === 'string') {
    return signInWithCustomToken(auth, customToken).then(() => {
      if (cancelled()) return;
      setError(null);
      navigate('/', { replace: true });
    });
  }

  if (isNoSeatsResult(data)) {
    setError(typeof data.message === 'string' && data.message ? data.message : NO_SEATS_MESSAGE);
    return;
  }

  setError('Sign-in could not be completed. Please try again.');
}

export const WaitingRoom: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const code = new URLSearchParams(location.search).get('code');
  const [imageUrl] = useRandomImage();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    let cancelled = false;
    const isCancelled = () => cancelled;

    const run = async () => {
      const existingUser = await waitForAuthUser(800);
      if (cancelled) return;

      if (existingUser) {
        navigate('/', { replace: true });
        return;
      }

      // DEVELOPMENT
      // const redirectUri = 'http://localhost:3000/oauth/waiting-room';
      const redirectUri = 'https://app.mindflowspeedreading.com/oauth/waiting-room';

      try {
        const data = await exchangeCleverCode(code, redirectUri);
        await applyCleverAuthResult(data, { cancelled: isCancelled, navigate, setError });
      } catch (err) {
        if (cancelled) return;

        // Twin request may have already completed successfully (e.g. no seats) before Clever rejected a reuse.
        const cachedSuccess = successfulResultByCode.get(code);
        if (cachedSuccess) {
          await applyCleverAuthResult(cachedSuccess, { cancelled: isCancelled, navigate, setError });
          return;
        }

        const signedInUser = await waitForAuthUser(2500);
        if (cancelled) return;

        if (signedInUser) {
          setError(null);
          navigate('/', { replace: true });
          return;
        }

        console.error('OAuth token exchange failed', err);
        setError('Sign-in failed. Please try again.');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [code, navigate]);

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
                  Wait a moment...
                </Text>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};
