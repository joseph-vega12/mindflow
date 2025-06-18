import React, { FC, useState } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Image as ChakraImage,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement,
  Spinner as ChakraSpinner,
  Text as ChakraText,
  Box as ChakraBox
} from '@chakra-ui/react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Joi from 'joi';

import { Link as ReactRouterLink } from 'react-router-dom';
import { BasePage, BasePageTitle, TransparentHeader } from 'components/layout/Pages';
import { ImageGallery } from 'components/common';
import { SpeedReadPricingCard } from 'components/Pages/PublicSpeedRead';
import { loadStripe } from '@stripe/stripe-js';
import 'firebase/functions';
import axios from 'axios';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';


export const couponSchema = Joi.object({
  couponCode: Joi.string().min(4).max(15).required(),
  expiryDate: Joi.date().iso().greater('now').required().messages({
    'any.required': 'Entered coupon is expired.'
  })
}).required();

const pricingCard = {
  title: 'For students',
  price: 147,
  payment: 'single payment',
  features: [
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

export const PublicSpeedReadBuy: FC = () => {
  const PRODUCT_SKU = 'internal-single-license';
  const PRODUCT_PRICE = 147;
  const navigate = useNavigate();
  const { register, getValues, reset } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [paypalPrice, setPaypalPrice] = useState(PRODUCT_PRICE);
  const [productSku, setProductSku] = useState(PRODUCT_SKU);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [stripePublicKey] = useState(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

  const handleCreatePaypalOrder = (data: any, actions: { order: { create: (any: any) => Promise<any> } }) => {
    return actions.order.create({
      application_context: {
        brand_name: 'Mindflow'
      },
      purchase_units: [
        {
          amount: {
            value: paypalPrice
          }
        }
      ]
    });
  };

  const handleCreateStripeOrder = async (priceId) => {
    setIsLoading(true);

    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);


    const stripe = await stripePromise;

    const response = await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/createCheckoutSession`, {
      product_name: 'Single license',
      amount: paypalPrice,
      quantity: 1,
      cancel_url: 'https://app.mindflowspeedreading.com/free/buy-program',
      // success_url:'http://localhost:3000/activate-purchased-license/stripe/{CHECKOUT_SESSION_ID}?redirected=true'
      success_url: 'https://app.mindflowspeedreading.com/activate-purchased-license/stripe/{CHECKOUT_SESSION_ID}/?redirected=true'

    });

    const session = response.data;
    const sessionId = session.id;


    const result = await stripe.redirectToCheckout({
      sessionId: sessionId,
    });

    if (result.error) {
      console.error(result.error.message);
    }

  };


  const handleCreateCreditCardOrder = () => {
    setIsLoading(true);

    // @ts-ignore
    window.CollectCheckout.redirectToCheckout({
      lineItems: [
        {
          sku: productSku,
          quantity: 1
        }
      ],
      cancelUrl: 'https://app.mindflowspeedreading.com/free/buy-program',
      successUrl: 'https://app.mindflowspeedreading.com/activate-purchased-license/group_iso/{TRANSACTION_ID}?redirected=true'
    });
  };

  const handleCouponSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fields = getValues();

    const couponsRef = collection(db, 'coupons');
    const couponsQuery = query(
      couponsRef,
      where('code', '==', fields.couponCode),
      where('expiryDate', '>', Date.now())
    );

    const querySnapshot = await getDocs(couponsQuery);



    if (querySnapshot.empty) {
      return toast.error('Coupon Code Is Invalid!');
    }

    const coupon = querySnapshot.docs[0].data();

    setAppliedCoupon(fields.couponCode);
    setPaypalPrice(coupon.price);
    setProductSku(coupon.name);
    toast.success(`Coupon with ${coupon.name} was Applied`);
  };



  const handleCouponRemove = () => {
    if (appliedCoupon) {
      setAppliedCoupon('');
      setProductSku(PRODUCT_SKU);
      setPaypalPrice(PRODUCT_PRICE);
      reset({
        couponCode: ''
      });
    }
  };

  return (
    <ChakraBox
      boxShadow="0px 3px 8px rgba(0, 0, 0, 0.45);"
      borderRadius="32px"
      width="100%"
      maxWidth="1660px"
      margin="0 auto"
      paddingLeft="0px"
      paddingRight="0px"
    >
      <TransparentHeader />
      <ChakraFlex background="white" padding="lg" pr="45px" pl="45px">
        <ChakraFlex flex="6" direction="column" pr="lg">
          <ChakraBox fontSize="38px" paddingBottom="md" color="#05314A" borderBottom="1px solid #BDBDBD">
            Get MindFlow’s{' '}
            <ChakraText fontWeight="bold" as="span">
              Speed Reading Program
            </ChakraText>
          </ChakraBox>
          <ChakraBox flexDirection="column">
            <ChakraFlex width="100%" mt="lg" alignItems={{ xs: 'center', lg: 'flex-start' }}>
              <ChakraText color="teal.500" marginBottom="sm" mr="lg">
                Price:{' '}
                <ChakraText color="blue.500" as="span">
                  $147
                </ChakraText>
              </ChakraText>
              <ChakraText color="teal.500" marginBottom="sm">
                Category:{' '}
                <ChakraText as="span" color="blue.500">
                  Software
                </ChakraText>
              </ChakraText>
            </ChakraFlex>

            <ChakraFlex>
              <ChakraFlex flexDirection="column" textAlign="center">
                {isLoading ? (
                  <ChakraFlex display="flex" justifyContent="center" alignItems="center" py="lg" mb="lg">
                    <ChakraSpinner speed="0.8s" color="blue.800" boxSize="50px" thickness="4px" emptyColor="gray.100" />
                  </ChakraFlex>
                ) : (
                  <ChakraFlex flexDirection="column">
                    {stripePublicKey ? (
                      <>
                        <ChakraButton
                          onClick={handleCreateStripeOrder}
                          size="xs"
                          borderRadius="xs"
                          width="100%"
                          colorScheme="blue"
                          fontSize="sm"
                        >
                          Buy now
                        </ChakraButton>
                      </>
                    ) : (
                      <>
                        <PayPalButtons
                          style={{ layout: 'horizontal', color: 'blue' }}
                          createOrder={handleCreatePaypalOrder}
                          onApprove={async (data, actions) => {
                            const details = await actions.order.capture();

                            toast.success('Congratulations! You purchased the Mindflow program successfully');

                            navigate(`/activate-purchased-license/paypal/${details.id}?redirected=true`);
                          }}
                          onCancel={() => {
                            toast.warn('You canceled your purchase');
                          }}
                        />
                        <ChakraText fontSize="sm" marginY="sm">
                          OR
                        </ChakraText>
                        <ChakraButton
                          onClick={handleCreateCreditCardOrder}
                          size="xs"
                          borderRadius="xs"
                          width="100%"
                          colorScheme="blue"
                          fontSize="sm"
                        >
                          Credit Card
                        </ChakraButton>
                      </>
                    )}
                    <form
                      onSubmit={(e) => {
                        handleCouponSubmit(e);
                      }}
                    >
                      <ChakraInputGroup mt="3" size="sm">
                        <ChakraInput
                          name="couponCode"
                          type="coupon"
                          {...register("couponCode")}
                          placeholder={appliedCoupon === '' ? 'Coupon' : appliedCoupon}
                          borderRadius="sm"
                          required
                          disabled={appliedCoupon !== ''}
                        />
                        <ChakraInputRightElement>
                          <ChakraButton
                            type={appliedCoupon ? 'button' : 'submit'}
                            width="50%"
                            size="sm"
                            fontSize="xs"
                            borderRadius="xs"
                            colorScheme="blackAlpha"
                            onClick={handleCouponRemove}
                          >
                            {appliedCoupon ? 'X' : 'Apply'}
                          </ChakraButton>
                        </ChakraInputRightElement>
                      </ChakraInputGroup>
                    </form>
                    <ChakraText
                      display={`${appliedCoupon ? '' : 'none'}`}
                      align="left"
                      marginBottom="sm"
                      color="ui.500"
                      fontSize="sm"
                      fontWeight="bold"
                      mt="sm"
                    >
                      Coupon Applied: {appliedCoupon}
                    </ChakraText>
                  </ChakraFlex>
                )}
                <ChakraButton
                  colorScheme="gray"
                  color="gray"
                  variant="outline"
                  mt="150px"
                  as={ReactRouterLink}
                  to={'/free/program'}
                >
                  Return
                </ChakraButton>
              </ChakraFlex>
            </ChakraFlex>
          </ChakraBox>
        </ChakraFlex>
        <ChakraFlex flex="4">
          <ChakraFlex flex="2" minHeight={{ xl: 'unset', lg: '50vh' }}>
            <ImageGallery images={galleryImages} />
          </ChakraFlex>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraBox borderBottomLeftRadius={32} borderBottomRightRadius={32} background="white" height="32px"></ChakraBox>
    </ChakraBox>
  );
};
