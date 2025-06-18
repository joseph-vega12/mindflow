import React, { FC, useState } from 'react';

import {
  chakra,
  Button as ChakraButton,
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
  Grid as ChakraGrid,
  Input as ChakraInput,
  Spinner as ChakraSpinner,
  Text as ChakraText
} from '@chakra-ui/react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { CreateOrderActions, OnApproveActions, OnApproveData } from '@paypal/paypal-js';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Joi from 'joi';

import { BusinessApproval } from 'types';

import { Slider } from 'components/common';
import { withMask } from 'use-mask-input';

export type BusinessAprovalSubmit = Pick<
  BusinessApproval,
  'quantity' | 'name' | 'email' | 'phone' | 'businessName' | 'businessUrl' | 'heardAboutUs'
>;

export const businessSchema = Joi.object<BusinessAprovalSubmit>({
  quantity: Joi.number().min(1).max(200).required(),
  name: Joi.string().min(5).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .min(5)
    .max(50)
    .required(),
  phone: Joi.string().min(7).max(14).required(),
  businessName: Joi.string().min(5).max(50).required(),
  businessUrl: Joi.string().required().uri(),
  heardAboutUs: Joi.string().min(4).required()
}).required();

interface Props {
  isLoading: boolean;

  defaultValues?: BusinessAprovalSubmit;
  onSubmit: (values: BusinessAprovalSubmit) => void;
}

const PRODUCT_SKU = 'business-single-license';
// const PRODUCT_SKU = 'enterprise-single-license';
const PRODUCT_PRICE = 100;

export const BusinessLeadForm: FC<Props> = ({ isLoading, onSubmit }) => {
  const [, setPaypalLoading] = useState(false);
  const [stripePublicKey] = useState(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

  const navigate = useNavigate();

  const { register, control, getValues } = useForm({
    defaultValues: {
      quantity: 1
    }
  });

  const quantity = useWatch({
    control,
    name: 'quantity'
  }) as number;

  const totalPricing = quantity * 100;

  const handleFormSubmit = () => {
    const fields = getValues();
    const result = businessSchema.validate(fields, { abortEarly: true });

    if (result.error) {
      return toast.error(result.error.message);
    }

    const values = result.value as BusinessAprovalSubmit;

    onSubmit(values);
  };

  const handleCreatePaypalOrder = async (data: Record<string, unknown>, actions: CreateOrderActions) => {
    const fields = getValues();

    const result = businessSchema.validate(fields, { abortEarly: true });

    if (result.error) {
      toast.error(result.error.message);
      return;
    }

    const values = result.value as BusinessAprovalSubmit;

    setPaypalLoading(true);

    const qty = values.quantity;

    return actions.order.create({
      application_context: {
        brand_name: 'Mindflow'
      },
      purchase_units: [
        {
          amount: {
            value: String(PRODUCT_PRICE * qty),
            breakdown: {
              item_total: {
                value: String(PRODUCT_PRICE * qty),
                currency_code: 'USD'
              }
            }
          },
          items: [
            {
              name: 'Business Single License',
              description: 'Single license for business',
              sku: PRODUCT_SKU,
              quantity: String(qty),
              category: 'DIGITAL_GOODS',
              unit_amount: {
                value: '100',
                currency_code: 'USD'
              }
            }
          ]
        }
      ]
    });
  };

  const handlePaypalApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    const fields = getValues();
    const result = businessSchema.validate(fields, { abortEarly: true });

    const values = result.value as BusinessAprovalSubmit;

    const orderDetails = await actions.order.capture();
    const businessApprovalResponse = await axios.post(
      `${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/createBusinessApproval`,
      values
    );

    const { id: businessApprovalId } = businessApprovalResponse.data;

    toast.success('Congratulations! You purchased the Mindflow program successfully');

    navigate(`business-discount/callback/paypal/${orderDetails.id}/${businessApprovalId}`);
  };

  return (
    <ChakraFlex flexDirection="column">
      {isLoading ? (
        <ChakraFlex display="flex" justifyContent="center" alignItems="center" py="lg" mb="lg">
          <ChakraSpinner speed="0.8s" color="blue.800" boxSize="50px" thickness="4px" emptyColor="gray.100" />
        </ChakraFlex>
      ) : (
        <ChakraFlex flexDirection="column">
          <ChakraFlex flexDirection="column" pb={2} px={2}>
            <ChakraFlex flex="1" flexDirection="column" mb={2}>
              <ChakraFormLabel flexDirection="column">Number of licenses: </ChakraFormLabel>
              <Controller
                name="quantity"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
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

          <ChakraFlex flex="1" flexDirection="column" gridGap={2}>
            <ChakraFlex flexDirection="column" mb={2}>
              <ChakraFormLabel>Name *</ChakraFormLabel>
              <ChakraInput required type="name" name="name" {...register("name")} borderColor="gray.500" />
            </ChakraFlex>

            <ChakraFlex flexDirection="column" mb={2}>
              <ChakraFormLabel>Email *</ChakraFormLabel>
              <ChakraInput required type="email" name="email" {...register("email")} borderColor="gray.500" />
            </ChakraFlex>

            <ChakraFlex flexDirection="column" mb={2}>
              <ChakraFormLabel>Phone *</ChakraFormLabel>
              <ChakraInput
                required
                name="phone"
                height="40px"
                paddingX="md"
                border="sm"
                borderRadius="md"
                borderColor="gray.500"
                transitionDuration="0.3s"
                _focus={{
                  outlineColor: 'blue.500'
                }}
                disabled={isLoading}
                ref={withMask("9999999999999")}
                {...register("phone")}
                style={{ border: "1px solid #999" }}
              />
            </ChakraFlex>

            <ChakraFlex flexDirection="column" mb={2}>
              <ChakraFormLabel>Business Name *</ChakraFormLabel>
              <ChakraInput required type="name" name="businessName" {...register("businessName")} borderColor="gray.500" />
            </ChakraFlex>

            <ChakraFlex flexDirection="column" mb={2}>
              <ChakraFormLabel>Business Url *</ChakraFormLabel>
              <ChakraInput
                required
                type="url"
                name="businessUrl"
                borderColor="gray.500"
                {...register("businessUrl", {
                  setValueAs: (value) => (value.includes('https://') ? value : `https://${value}`)
                })}
              />
            </ChakraFlex>

            <ChakraFlex flexDirection="column" mb={2}>
              <ChakraFormLabel>Where did you hear of MindFlow? *</ChakraFormLabel>
              <ChakraInput required name="heardAboutUs" borderColor="gray.500" {...register("heardAboutUs")} />
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
      )}
    </ChakraFlex>
  );
};
