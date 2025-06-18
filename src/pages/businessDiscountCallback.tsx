import React, { FC, useEffect } from 'react';

import {
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Spinner as ChakraSpinner,
  Text as ChakraText
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from 'react-query';
import axios from 'axios';

import { PublicLayout } from 'layouts/Public';

import { UserDetails } from 'types';

interface RouteParams {
  id: string;
  orderId: string;
  provider: string;
}

export const BusinessDiscountCallback: FC = () => {
  const { id, orderId, provider } = useParams<RouteParams>();
  const navigate = useNavigate();

  const businessDiscountCallbackMutation = useMutation<any>(
    ['businessDiscountCallback'],
    async () => {

      await axios.post<UserDetails>(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/businessApprovalPaymentCallback`, {
        id,
        orderId,
        provider
      });
    },
    {
      onSuccess() {
        toast.success('Thank you for your purchase!');

        navigate('/');
      },
      onError(e: any) {
        toast.error(e?.response?.data?.message ?? 'Unknown error');
      }
    }
  );

  useEffect(() => {
    businessDiscountCallbackMutation.mutate();
  }, []);

  return (
    <PublicLayout>
      <ChakraFlex flexDirection="column" boxShadow="lg" borderRadius="lg" bgColor="white">
        {businessDiscountCallbackMutation.isLoading ? (
          <ChakraFlex display="flex" justifyContent="center" alignItems="center" py="lg" mb="lg">
            <ChakraSpinner speed="0.8s" color="blue.800" boxSize="50px" thickness="4px" emptyColor="gray.100" />
          </ChakraFlex>
        ) : (
          <ChakraFlex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            marginBottom="md"
            pt={12}
            px={10}
            width="100%"
          >
            {businessDiscountCallbackMutation.isSuccess ? (
              <ChakraHeading mb={3} fontSize="2xl" textAlign="center" color="green.500">
                Thank you for your purchase. We're going to contact you shortly.
              </ChakraHeading>
            ) : (
              <ChakraFlex flexDir="column" textAlign="center">
                <ChakraHeading mb={3} fontSize="2xl" color="red.500">
                  An error has ocurred!
                </ChakraHeading>

                <ChakraText>
                  Feel free to contact us at
                  <b> support@mindflowspeedreading.com</b>
                </ChakraText>
              </ChakraFlex>
            )}

            <ChakraFlex gap="lg" fontWeight="bolder" my="md">
              <ChakraText>ID: {id}</ChakraText>
              <ChakraText>OrderId: {orderId}</ChakraText>
            </ChakraFlex>
          </ChakraFlex>
        )}
      </ChakraFlex>
    </PublicLayout>
  );
};
