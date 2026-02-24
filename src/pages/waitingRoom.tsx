import React, { FC, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Flex, Progress, Text } from '@chakra-ui/react';
import { signInWithCustomToken } from 'firebase/auth';

import { Icon } from 'components/common';
import { auth } from 'lib/firebase/firebaseInit';
import { useRandomImage } from 'lib/firebase';
import axios from 'axios';

const API_BASE = 'https://apiv2-my3sfr4paq-uc.a.run.app';

export const WaitingRoom: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const code = new URLSearchParams(location.search).get('code');
    const [imageUrl] = useRandomImage();
    const [error, setError] = useState<string | null>(null);
    const hasExchangedRef = useRef(false);

    useEffect(() => {
        if (!code || hasExchangedRef.current) return;
        hasExchangedRef.current = true;

        // DEVELOPMENT
        // const redirectUri = 'http://localhost:3000/oauth/waiting-room';
        const redirectUri = 'https://app.mindflowspeedreading.com/oauth/waiting-room';

        axios
            .post(`${API_BASE}/oauthCleverAuth`, {
                code,
                redirect_uri: redirectUri
            })
            .then(async (res) => {
                const data = res?.data ?? {};
                console.log(data, 'data');
                const customToken = data.customToken;
                const hasAvailableSeat = data.hasAvailableSeat;

                if (customToken && typeof customToken === 'string') {
                    await signInWithCustomToken(auth, customToken);
                    navigate('/', { replace: true });
                    return;
                }

                if (hasAvailableSeat === false) {
                    setError('No available seats for your district. Please contact your school.');
                } else {
                    setError('Sign-in could not be completed. Please try again.');
                }
            })
            .catch((err) => {
                console.error('OAuth token exchange failed', err);
                setError('Sign-in failed. Please try again.');
            });
    }, [code, location.pathname, navigate]);

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
                                    <Progress
                                        size="sm"
                                        borderRadius={5}
                                        width="80%"
                                        colorScheme="blue"
                                        isIndeterminate
                                    />
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
