import React, { FC, useState } from 'react';

import {
  chakra,
  Button as ChakraButton,
  Divider as ChakraDivider,
  // Separator as ChakraDivider,
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
  // Field,
  Grid as ChakraGrid,
  Heading as ChakraHeading,
  Drawer as ChakraModal,
  DrawerBody as ChakraModalBody,
  DrawerContent as ChakraModalContent,
  DrawerHeader as ChakraModalHeader,
  // ModalOverlay as ChakraModalOverlay,
  Spinner as ChakraSpinner,
  Text as ChakraText
} from '@chakra-ui/react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { CreateOrderActions, OnApproveActions, OnApproveData } from '@paypal/paypal-js';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import { useBusiness } from 'lib/customHooks';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';

import { Icon } from 'components/common';
import { Slider } from 'components/common';

import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';


interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PRODUCT_SKU = 'business-purchase-additional-licenses';
// const PRODUCT_SKU = 'enterprise-single-license'; // Developement

export const BuyLicensesModal: FC<Props> = ({ isOpen, onClose }) => {
  const { businessId, businessQuery } = useBusiness();
  const [, setPaypalLoading] = useState(false);
  const [stripePublicKey] = useState(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

  const navigate = useNavigate();

  const { control, getValues } = useForm({
    defaultValues: {
      quantity: 1
    }
  });

  const quantity = useWatch({
    control,
    name: 'quantity'
  }) as number;
  const totalPricing = quantity * businessQuery.data?.licensePrice;

  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

  const { mutate: handleCreateStripeOrderMutation } = useMutation(
    async () => {

      const stripe = await stripePromise;

      const response = await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/createCheckoutSession`, {
        product_name: 'Business purchase additional licenses',
        amount: businessQuery.data?.licensePrice,
        quantity: quantity,
        cancel_url: 'https://app.mindflowspeedreading.com/',
        // success_url:`http://localhost:3000/additional-purchased-license/stripe/{CHECKOUT_SESSION_ID}/${businessId}/${quantity}`
        success_url: `https://app.mindflowspeedreading.com/additional-purchased-license/stripe/{CHECKOUT_SESSION_ID}/${businessId}/${quantity}`
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
        onClose();
        toast.info('You are now being redirected to the payment page.');
      },
      onError: () => {
        onClose();
        toast.error('Something went wrong. Please try again.');
      }
    }
  );

  const { mutate: handleCreateCreditCardOrderMutation, isLoading } = useMutation(
    async () => {
      // @ts-ignore
      window.CollectCheckout.redirectToCheckout({
        lineItems: [
          {
            sku: PRODUCT_SKU,
            quantity: quantity
          }
        ],
        successUrl: `https://app.mindflowspeedreading.com/additional-purchased-license/group_iso/{TRANSACTION_ID}/${businessId}/${quantity}`,
        cancelUrl: 'https://app.mindflowspeedreading.com/'
      });
    },
    {
      onSuccess: () => {
        onClose();
        toast.info('You are now being redirected to the payment page.');
      },
      onError: () => {
        onClose();
        toast.error('Something went wrong. Please try again.');
      }
    }
  );


  const handleFormSubmit = () => {
    if (stripePublicKey) {
      handleCreateStripeOrderMutation();
    }
    else {
      handleCreateCreditCardOrderMutation();
    }
  };


  const handleCreatePaypalOrder = async (data: Record<string, unknown>, actions: CreateOrderActions) => {
    const fields = getValues();
    const paypalPricing = String(businessQuery.data.licensePrice * fields.quantity);
    setPaypalLoading(true);

    return actions.order.create({
      application_context: {
        brand_name: 'Mindflow'
      },
      purchase_units: [
        {
          amount: {
            value: paypalPricing,
            breakdown: {
              item_total: {
                value: paypalPricing,
                currency_code: 'USD'
              }
            }
          },
          items: [
            {
              name: 'Business Single License',
              description: 'Single license for business',
              sku: PRODUCT_SKU,
              quantity: String(quantity),
              category: 'DIGITAL_GOODS',
              unit_amount: {
                value: paypalPricing,
                currency_code: 'USD'
              }
            }
          ]
        }
      ]
    });
  };

  const handlePaypalApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    const qty = getValues().quantity;
    const orderDetails = await actions.order.capture();
    toast.success('Congratulations! You purchased the Mindflow program successfully');
    navigate(`/additional-purchased-license/paypal/${orderDetails.id}/${businessId}/${qty}`);
  };

  return (
    <ChakraModal blockScrollOnMount={isOpen} isOpen={isOpen} isCentered onClose={onClose} size="lg">
      {/* <ChakraModalOverlay /> */}
      {/* <ChakraModalContent paddingX="xl" borderRadius="lg"> */}
      <ChakraModalContent>
        <ChakraModalHeader paddingTop="xl">
          <ChakraFlex marginBottom="lg" justifyContent="space-between" alignItems="center">
            <ChakraFlex display="flex" alignItems="center">
              <ChakraHeading fontSize="2xl" color="blue.500">
                Buy Additional Licenses
              </ChakraHeading>
            </ChakraFlex>
            <Icon name="small-close" cursor="pointer" color="gray.500" onClick={onClose} />
          </ChakraFlex>
          <ChakraDivider borderColor="gray.500" />
        </ChakraModalHeader>
        <ChakraModalBody overflowY="auto" maxH="60vh" pb="5vh">
          <ChakraFlex flexDirection="column" mb="2" mt="2">
            <ChakraFlex flexDirection="column" pb={2} px={2}>
              <ChakraFlex flex="1" flexDirection="column" mb={2}>
                {/* <Field.Label flexDirection="column">Number of licenses: </Field.Label> */}
                <ChakraFormLabel>Number of licenses: </ChakraFormLabel>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Slider min={1} max={200} onChange={onChange} step={1} value={value} />
                  )}
                />
              </ChakraFlex>
              <ChakraFlex alignItems="end" justifyContent="center">
                <ChakraFormLabel>
                  <b>Total: ${totalPricing}.00</b>
                </ChakraFormLabel>
              </ChakraFlex>
            </ChakraFlex>

            <ChakraFlex p={4} my={2} justifyContent="flex-end" alignItems="center">
              {isLoading ? (
                <ChakraFlex display="flex" justifyContent="center" alignItems="center" py="lg" mb="lg">
                  <ChakraSpinner speed="0.8s" color="blue.800" boxSize="50px" thickness="4px" emptyColor="gray.100" />
                </ChakraFlex>
              ) : (
                <ChakraGrid
                  width="100%"
                  justifyContent="space-evenly"
                  alignItems="center"
                  templateColumns="1fr 1fr 1fr"
                  gap="md"
                  textAlign="center"
                >
                  {stripePublicKey ? (
                    <>
                      <ChakraButton
                        size="xs"
                        width="100%"
                        fontSize="sm"
                        borderRadius="xs"
                        colorScheme="blue"
                        onClick={handleFormSubmit}
                      >
                        Buy now
                      </ChakraButton>
                    </>
                  ) : (
                    <>
                      <PayPalButtons
                        style={{ layout: 'horizontal', color: 'blue' }}
                        createOrder={handleCreatePaypalOrder}
                        onApprove={handlePaypalApprove}
                        onCancel={() => toast.warn('You canceled your purchase')}
                      />
                      <ChakraText fontSize="md" marginY="none">
                        OR
                      </ChakraText>

                      <ChakraButton
                        size="xs"
                        width="100%"
                        fontSize="sm"
                        borderRadius="xs"
                        colorScheme="facebook"
                        onClick={handleFormSubmit}
                      >
                        Credit Card
                      </ChakraButton>
                    </>
                  )}
                </ChakraGrid>
              )}
            </ChakraFlex>
          </ChakraFlex>
        </ChakraModalBody>
      </ChakraModalContent>
    </ChakraModal>
  );
};
