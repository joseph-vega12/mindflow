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

import { Icon } from 'components/common';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import Joi from 'joi';

import { TransparentHeader } from 'components/layout/Pages';
import { ImageGallery } from 'components/common';
import { SpeedReadPricingCard } from 'components/Pages/PublicSpeedRead';

import { Link as ReactRouterLink } from 'react-router-dom';
import { useFirebaseContext } from 'lib/firebase';

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

export const PublicSpeedReadPricing: FC = () => {
  const PRODUCT_SKU = 'internal-single-license';
  const PRODUCT_PRICE = 147;
  const { firestore } = useFirebaseContext();
  const { register, getValues, reset } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [paypalPrice, setPaypalPrice] = useState(PRODUCT_PRICE);
  const [productSku, setProductSku] = useState(PRODUCT_SKU);
  const [appliedCoupon, setAppliedCoupon] = useState('');

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
      cancelUrl: 'https://app.mindflowspeedreading.com/free/program',
      successUrl:
        'https://app.mindflowspeedreading.com/activate-purchased-license/group_iso/{TRANSACTION_ID}?redirected=true'
    });
  };

  const handleCouponSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('handle coupon submit');
    const fields = getValues();

    const querySnapshot = await firestore
      .collection('coupons')
      .where('code', '==', fields.couponCode)
      .where('expiryDate', '>', Date.now())
      .get();

    if (querySnapshot.empty) {
      return toast.error('Coupon Code Is Invalid!');
    }

    setAppliedCoupon(fields.couponCode);
    setPaypalPrice(querySnapshot.docs[0].data().price);
    setProductSku(querySnapshot.docs[0].data().name);
    toast.success(`Coupon with ${querySnapshot.docs[0].data().name} was Applied`);
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
            <ReactRouterLink to="/free/buy-program">
              <ChakraButton
                mt="lg"
                colorScheme="green"
                boxShadow="1px 2px 5px rgba(0, 0, 0, 0.45)"
                color="white"
                size="md"
                fontSize={18}
                leftIcon={<Icon name="cart-arrow-right" />}
              >
                Buy Now
              </ChakraButton>
            </ReactRouterLink>
            <ChakraFlex>
              <ChakraFlex marginBottom="lg" flexDirection="column" flex="6">
                <ChakraText pt="lg" pr="lg">
                  MindFlow improves your performance, time management and mindset. The training combines speed reading
                  skills with mindset techniques to increase reading speed, improve focus and boost test taking
                  performance. Once you learn to read faster, comprehend more and feel more relaxed and focused, you
                  perform better and score your best. MindFlow videos, practice (diagnostic and reading speed tests) are
                  on a fun and exciting gamified platform. You benefit from our holistic and mindful training similar to
                  those used by high performing athletes. Overall, MindFlow offers skills for your admissions tests,
                  school and in life. Purchase this game-changing training to complement your tutoring, study and test
                  preparation needs.
                </ChakraText>
              </ChakraFlex>

              <ChakraFlex marginTop="md" gridGap="md" flexDirection="column" flex="4">
                <ChakraFlex height="fit-content" marginRight="md" flex="1">
                  <SpeedReadPricingCard
                    title={pricingCard.title}
                    price={pricingCard.price}
                    payment={pricingCard.payment}
                    features={pricingCard.features}
                  />
                </ChakraFlex>
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
