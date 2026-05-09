import React, { FC, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Spinner as ChakraSpinner,
  Text as ChakraText
} from '@chakra-ui/react';
import { ELicenseStatus, ELicenseType, License, LicenseDocumentWithId } from 'types';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useMutation } from 'react-query';
import axios from 'axios';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

import { PublicLayout } from '../layouts/Public';

interface RouteParams {
  businessId: string;
  orderId: string;
  provider: string;
  quantity: string;
}
export const BusinessPurchaseAdditionalLicenses: FC = () => {
  const { businessId, orderId, provider, quantity } = useParams();

  const { mutate: createLicensesOnPurchase } = useMutation(async () => {
    // Student License Creation under the Business
    const licensesNumber = Array.from(Array(Number(quantity)));
    const emptyLicense: License = {
      businessId: businessId,
      status: ELicenseStatus.INACTIVE,
      type: ELicenseType.BUSINESS_STUDENT,
      orderId: orderId,
      provider: 'manual_sell',
      durationDays: 90,
      purchaseDate: +new Date(),
      timestamp: +new Date()
    };

    const batch = writeBatch(db);
    const transactionId = uuidv4();

    const licenses: LicenseDocumentWithId[] = [];
    for (const _ of licensesNumber) {
      const licenseRef = doc(collection(db, 'licenses'));
      batch.set(licenseRef, emptyLicense);
      licenses.push({ id: licenseRef.id, ...emptyLicense, orderId: transactionId });
    }
    await batch.commit();
  });

  const businessDiscountCallbackMutation = useMutation<any>(
    ['businessDiscountCallback'],
    async () => {
      await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/sendLicenseOrderReceipt`, {
        orderId,
        provider,
        quantity: quantity
      });
    },
    {
      onSuccess() {
        createLicensesOnPurchase();
        toast.success('Thank you for your purchase!');
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
              <ChakraText>ID: {businessId}</ChakraText>
              <ChakraText>OrderId: {orderId}</ChakraText>
            </ChakraFlex>
          </ChakraFlex>
        )}
      </ChakraFlex>
    </PublicLayout>
  );
};
