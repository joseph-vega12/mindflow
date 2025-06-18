import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import React, { FC } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
  Input as ChakraInput,
  Modal as ChakraModal,
  ModalBody as ChakraModalBody,
  ModalCloseButton as ChakraModalCloseButton,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalHeader as ChakraModalHeader,
  ModalOverlay as ChakraModalOverlay,
  ModalProps as ChakraModalProps,
  SimpleGrid as ChakraSimpleGrid,
  Text as ChakraText
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { ELicenseStatus, ELicenseType, License, LicenseDocumentWithId } from 'types';
import { useFirebaseContext } from 'lib/firebase';
import axios from 'axios';
import Joi from 'joi';

interface Props extends Omit<ChakraModalProps, 'children'> {
  refetchCoupons: () => void;
}

interface FormValues {
  code: string;
  name: string;
  price: number;
  expiryDate: string;
}

export const couponSchema = Joi.object({
  code: Joi.string().min(4).max(15),
  name: Joi.string().min(5).max(50),
  price: Joi.string().min(0),
  expiryDate: Joi.string()
}).required();

export const CouponsPanelAdd: FC<Props> = ({ isOpen, onClose, refetchCoupons }) => {
  const { register, getValues } = useForm<FormValues>({
    defaultValues: {}
  });

  const addCoupon = useMutation(async (values: FormValues) => {
    try {
      // http://127.0.0.1:5001/mindflow-staging/us-central1/api/createCoupon      
      await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/manageCoupon`, {
        coupon: {
          code: values.code,
          name: values.name,
          price: values.price,
          expiryDate: new Date(values.expiryDate).getTime()
        },
        type: 'add'
      });
      toast.success('Coupon created');
      refetchCoupons();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  });

  const handleSubmit = () => {
    const values = getValues();
    const result = couponSchema.validate(values, { abortEarly: true });

    if (result.error) {
      return toast.error(result.error.message);
    }
    addCoupon.mutate(values);
  };

  return (
    <ChakraModal isCentered size="lg" isOpen={isOpen} onClose={onClose}>
      <ChakraModalOverlay />
      <ChakraModalContent borderRadius="sm">
        <ChakraModalHeader borderBottom="sm" borderBottomColor="gray.300">
          New coupon
        </ChakraModalHeader>
        <ChakraModalCloseButton top="12px" borderRadius="sm" />
        <ChakraModalBody paddingY="lg">
          <ChakraSimpleGrid width="100%" columns={2} gap="md">
            <ChakraFlex flexDirection="column">
              <ChakraFormLabel>Code</ChakraFormLabel>
              <ChakraInput
                required
                type="string"
                name="code"
                borderColor="gray.500"
                disabled={addCoupon.isLoading}
                {...register("code")}
              />
            </ChakraFlex>
            <ChakraFlex flexDirection="column">
              <ChakraFormLabel>Name</ChakraFormLabel>
              <ChakraInput
                required
                type="string"
                name="name"
                borderColor="gray.500"
                disabled={addCoupon.isLoading}
                {...register("name")}
              />
            </ChakraFlex>
            <ChakraFlex flexDirection="column">
              <ChakraFormLabel>Price</ChakraFormLabel>
              <ChakraInput
                required
                type="number"
                name="price"
                borderColor="gray.500"
                disabled={addCoupon.isLoading}
                {...register("price")}
              />
            </ChakraFlex>
            <ChakraFlex flexDirection="column">
              <ChakraFormLabel>Expiry date</ChakraFormLabel>
              <ChakraInput
                type="date"
                marginRight="md"
                placeholder="DD/MM/YYYY"
                borderLeftRadius="none"
                borderRadius="sm"
                disabled={addCoupon.isLoading}
                name="expiryDate"
                {...register("expiryDate")}
              />
            </ChakraFlex>
          </ChakraSimpleGrid>
        </ChakraModalBody>
        <ChakraModalFooter borderTop="sm" borderTopColor="gray.300" justifyContent="space-between">
          <ChakraText cursor="pointer" colorScheme="blue" marginRight="lg" onClick={onClose}>
            Close
          </ChakraText>
          <ChakraButton borderRadius="sm" colorScheme="blue" onClick={handleSubmit} isLoading={addCoupon.isLoading}>
            Add
          </ChakraButton>
        </ChakraModalFooter>
      </ChakraModalContent>
    </ChakraModal>
  );
};
