import React, { FC, useState } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Image as ChakraImage,
  Spinner as ChakraSpinner,
  Text as ChakraText,
  useDisclosure
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useMutation } from 'react-query';
import axios from 'axios';

import { PublicLayout } from 'layouts/Public';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { BusinessAprovalSubmit, BusinessLeadForm } from 'components/Pages/BusinessDiscount/BusinessLeadForm';
import { ImageGallery, Modal } from 'components/common';
import { SpeedReadPricingCard } from 'components/Pages/PublicSpeedRead';

import { loadStripe } from '@stripe/stripe-js';

const pricingCard = {
  title: 'For business owners',
  price: 100,
  payment: 'per license',
  features: [
    'Monitor your students',
    'Speed Tests',
    'Diagnostic Tests',
    'Practice Modules',
    'Brain-Eye Coordination',
    'Exclusive Video and Animation Content',
    'Gamification UI',
    'Mindset Support',
    'Dashboard to track all progress',
    'Certificate for Program Completion'
  ]
};

const galleryImages = [
  'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/backgrounds%2Fprogram%2FImage%20for%20Store%20Mindflow%20small.jpg?alt=media&token=99ad2f45-2a1b-4b25-bb18-f1782bfe905e',
  'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/backgrounds%2Fprogram%2Fdiagnostic%20test%20mocku.png?alt=media&token=565c377b-f170-47cd-890c-906e4098af29',
  'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/backgrounds%2Fprogram%2FMost%20complete%20Speed%20Reading%20Tool%20-%20MindFlowpnmg.png?alt=media&token=e45bcd9c-cb92-48ff-bb83-3511a6451937'
];

const PRODUCT_SKU = 'business-single-license';

// const PRODUCT_SKU = 'enterprise-single-license';


export const BusinessDiscount: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stripePublicKey] = useState(process.env.REACT_APP_STRIPE_PUBLIC_KEY);


  const disclosure = useDisclosure();

  const handleCreateStripeOrderMutation = useMutation(
    async (body: BusinessAprovalSubmit) => {
      setIsLoading(true);

      const resp = await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/createBusinessApproval`, body);

      const { id } = resp.data;

      const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

      const stripe = await stripePromise;

      const response = await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/createCheckoutSession`, {
        product_name: 'Business single license',
        amount: 100,
        quantity: body.quantity,
        success_url: `https://app.mindflowspeedreading.com/business-discount/callback/stripe/{CHECKOUT_SESSION_ID}/${id}`,
        cancel_url: 'https://app.mindflowspeedreading.com/business-discount'
      });

      const session = response.data;
      const sessionId = session.id;


      const result = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });

      if (result.error) {
        console.error(result.error.message);
      }
    },
    {
      onSuccess: () => {
        disclosure.onClose();

        toast.info('You are now being redirected to the payment page.');
      },
      onError: () => {
        setIsLoading(false);
        disclosure.onClose();

        toast.error('Something went wrong. Please try again.');
      }
    }
  );

  const handleCreateCreditCardOrderMutation = useMutation(
    async (body: BusinessAprovalSubmit) => {
      setIsLoading(true);


      const resp = await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/createBusinessApproval`, body);

      const { id } = resp.data;

      // @ts-ignore
      window.CollectCheckout.redirectToCheckout({
        lineItems: [
          {
            sku: PRODUCT_SKU,
            quantity: body.quantity
          }
        ],
        successUrl: `https://app.mindflowspeedreading.com/business-discount/callback/group_iso/{TRANSACTION_ID}/${id}`,
        cancelUrl: 'https://app.mindflowspeedreading.com/business-discount'
      });

    },
    {
      onSuccess: () => {
        disclosure.onClose();

        toast.info('You are now being redirected to the payment page.');
      },
      onError: () => {
        setIsLoading(false);
        disclosure.onClose();

        toast.error('Something went wrong. Please try again.');
      }
    }
  );
  return (
    <PublicLayout>
      <Modal {...disclosure} size="md" title="Buy multiple licenses">
        <BusinessLeadForm
          isLoading={handleCreateCreditCardOrderMutation.isLoading}
          onSubmit={stripePublicKey ? handleCreateStripeOrderMutation.mutate : handleCreateCreditCardOrderMutation.mutate}
        />
      </Modal>
      <BasePage maxWidth="1660px" margin="0 auto" background="white" spacing="md">
        <BasePageTitle
          width="100%"
          display="flex"
          paddingBottom="md"
          paddingX={{ xs: 'lg', lg: 'none' }}
          textAlign={{ xs: 'center', lg: 'left' }}
          alignItems={{ xs: 'center', lg: 'baseline' }}
          justifyContent={{ xs: 'center', lg: 'space-between' }}
          title="Get a discount for your business"
        />
        <ChakraFlex>
          <ChakraFlex flexDirection="column">
            <ChakraFlex width="100%" marginBottom="lg">
              <ChakraFlex display={{ xs: 'none', lg: 'flex' }} minWidth="360px" height="160px" marginRight="lg">
                <ChakraImage
                  width="100%"
                  objectFit="cover"
                  borderRadius="sm"
                  src="https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/backgrounds%2Fprogram%2FMindflow%20Tag%201.png?alt=media&token=6633a061-665e-4999-911c-2cbf4dc00ee7"
                />
              </ChakraFlex>
              <ChakraFlex
                width="100%"
                height="100%"
                alignItems={{ xs: 'center', lg: 'flex-start' }}
                flexDirection="column"
              >
                <ChakraText marginBottom="sm" color="ui.600" fontSize="xl" fontWeight="bold">
                  MindFlow Program
                </ChakraText>
                <ChakraText color="blue.500" fontWeight="bold" marginBottom="sm">
                  Category:{' '}
                  <ChakraText fontWeight="normal" as="span">
                    Software
                  </ChakraText>
                </ChakraText>
                {isLoading ? (
                  <ChakraFlex display="flex" justifyContent="center" alignItems="center" py="lg" mb="lg">
                    <ChakraSpinner speed="0.8s" color="blue.800" boxSize="50px" thickness="4px" emptyColor="gray.100" />
                  </ChakraFlex>
                ) : (
                  <ChakraFlex flexDirection="column">
                    <ChakraButton
                      onClick={() => disclosure.onOpen()}
                      size="xs"
                      borderRadius="xs"
                      width="100%"
                      colorScheme="blue"
                      fontSize="sm"
                    >
                      Buy Licenses
                    </ChakraButton>
                  </ChakraFlex>
                )}
              </ChakraFlex>
            </ChakraFlex>
            <ChakraText>
              Welcome to MindFlow's business license and referral programs! You are making the right decision for your
              business and clients. MindFlow Speed Reading is an interactive online platform that trains students to
              read faster and comprehend more on their admissions tests or in-school reading. It is designed and proven
              to improve performance and increase test scores. MindFlow adds value to your teaching and their study.
              <b> Purchase full-use licenses for only $100 here–the full retail price is $147.</b>
              <br />
            </ChakraText>
            <ChakraText>
              Once we receive your order, we validate your business, then we email you codes. For each license
              purchased, you will receive a unique code to forward to your clients using the platform. Students register
              their accounts directly and indicate the particular test track they want to work on. The program features
              up to 12 hours of speed reading training, practice, speed tests, and diagnostic test passages based on
              their specific test track or school level. Our mindset channel helps students improve focus, confidence,
              and feel calm.
            </ChakraText>
          </ChakraFlex>
        </ChakraFlex>
        <ChakraFlex
          width="100%"
          height="100%"
          marginTop="md"
          gridGap="md"
          flexDirection={{ xl: 'row', lg: 'column-reverse' }}
        >
          <ChakraFlex height="fit-content" marginRight="md" flex="1">
            <SpeedReadPricingCard
              title={pricingCard.title}
              price={pricingCard.price}
              payment={pricingCard.payment}
              features={pricingCard.features}
            />
          </ChakraFlex>
          <ChakraFlex flex="2" minHeight={{ xl: 'unset', lg: '50vh' }}>
            <ImageGallery images={galleryImages} />
          </ChakraFlex>
        </ChakraFlex>
      </BasePage>
    </PublicLayout>
  );
};
