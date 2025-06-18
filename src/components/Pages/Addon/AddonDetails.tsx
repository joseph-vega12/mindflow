import React, { FC } from 'react';

import {
  Box,
  Button as ChakraButton,
  Flex as ChakraFlex,
  Image as ChakraImage,
  Text as ChakraText
} from '@chakra-ui/react';
import { PayPalButtons, PayPalButtonsComponentProps } from '@paypal/react-paypal-js';

import { ImageGallery } from 'components/common';
import { loadStripe } from '@stripe/stripe-js';

interface AddonDetailsProps {
  title: string;
  category: string;
  description?: string;
  price: number;
  image: string;
  images: string[];

  // If not price
  onAcessContent?: () => void;

  // If has price
  onApprove?: PayPalButtonsComponentProps['onApprove'];
  onCancel?: PayPalButtonsComponentProps['onCancel'];
}

  export const AddonDetails: FC<AddonDetailsProps> = ({
    title,
    category,
    description,
    price,
    image,
    images,
    onAcessContent,
    onApprove,
    onCancel,
    children
  }) => {
  const handleCreatePaypalOrder = (data: any, actions: { order: { create: (any: any) => Promise<any> } }) => {
    return actions.order.create({
      application_context: {
        brand_name: 'Mindflow'
      },
      purchase_units: [
        {
          amount: {
            value: `${price}.00`
          }
        }
      ]
    });
  };

  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
  
  const handleCreateCreditCardOrder = async () => {
    
    const stripe = await stripePromise;
   
    /*
    // @ts-ignore
    window.CollectCheckout.redirectToCheckout({
      lineItems: [
        {
          sku: 'internal-single-license',
          quantity: 1
        }
      ],
      successUrl: 'https://app.mindflowspeedreading.com/activate-purchased-license/group_iso/{TRANSACTION_ID}',
      cancelUrl: 'https://app.mindflowspeedreading.com/free/program'
    });
    */

    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: 'price_1PloSbFNMR6zfT44RuPgjI0K',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      cancelUrl: 'https://app.mindflowspeedreading.com/free/program',
      // successUrl: 'http://localhost:3000/activate-purchased-license/stripe/{CHECKOUT_SESSION_ID}?redirected=true'
      successUrl: 'https://app.mindflowspeedreading.com/activate-purchased-license/stripe/{CHECKOUT_SESSION_ID}?redirected=true'
    });
  };

  return (
    <ChakraFlex
      height="100%"
      padding="md"
      flexDirection={{
        lg: 'column',
        xl: 'row'
      }}
    >
      <ChakraFlex
        flex="1"
        flexDirection="column"
        marginBottom={{
          lg: 'xl',
          xl: 'none'
        }}
        marginRight={{
          lg: 'none',
          xl: 'xxl'
        }}
      >
        <ChakraFlex width="100%" marginBottom="lg">
          <ChakraFlex display={{ xs: 'none', lg: 'flex' }} minWidth="360px" height="160px" marginRight="lg">
            <ChakraImage width="100%" objectFit="cover" borderRadius="sm" src={image} />
          </ChakraFlex>
          <ChakraFlex
            width="100%"
            height="100%"
            alignItems={{ xs: 'center', lg: 'flex-start' }}
            justifyContent="space-between"
            flexDirection="column"
          >
            <ChakraText marginBottom={{ xs: 'sm', lg: 'none' }} color="ui.600" fontSize="xl" fontWeight="bold">
              {title}
            </ChakraText>
            <ChakraText color="blue.500" fontWeight="bold" marginBottom={{ xs: 'sm', lg: 'none' }}>
              Price:{' '}
              <ChakraText fontWeight="normal" as="span">
                {price === 0 ? 'Free' : `$${price}.00`}
              </ChakraText>
            </ChakraText>
            <ChakraText color="blue.500" fontWeight="bold" marginBottom={{ xs: 'sm', lg: 'none' }}>
              Category:{' '}
              <ChakraText fontWeight="normal" as="span">
                {category}
              </ChakraText>
            </ChakraText>
            {!price ? (
              <ChakraButton
                width="140px"
                borderRadius="sm"
                boxShadow="large"
                colorScheme="green"
                onClick={onAcessContent}
              >
                Access Content
              </ChakraButton>
            ) : (
              <Box maxW={{ xs: '70%', lg: '150px' }} textAlign="center">
                <PayPalButtons
                  style={{ layout: 'horizontal', color: 'blue' }}
                  createOrder={handleCreatePaypalOrder}
                  onApprove={onApprove}
                  onCancel={onCancel}
                />
                <ChakraText fontSize="sm" mb="xs">
                  OR
                </ChakraText>
                <ChakraButton
                  onClick={handleCreateCreditCardOrder}
                  size="xs"
                  borderRadius="xs"
                  width="100%"
                  colorScheme="facebook"
                  fontSize="sm"
                >
                  Credit Card
                </ChakraButton>
              </Box>
            )}
          </ChakraFlex>
        </ChakraFlex>
        <ChakraFlex alignItems="center" flexDirection="column" height="100%">
          {description}
          {children}
        </ChakraFlex>
      </ChakraFlex>
      {images && (
        <ChakraFlex width={{ xl: '50%', lg: '100%' }} height="100%" marginTop={{ xs: 'lg', lg: 'none' }}>
          <ImageGallery images={images} />
        </ChakraFlex>
      )}
    </ChakraFlex>
  );
};
