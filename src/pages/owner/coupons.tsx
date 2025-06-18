import moment from 'moment';

import React, { FC, useMemo, useState } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement,
  useDisclosure
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useQuery } from 'react-query';

import { CouponDocumentWithId, Coupon } from 'types';

import { Icon } from 'components/common';

import { CouponsPanelAdd, CouponsPanelListing } from 'components/Pages/Owner/OwnerCouponsPanel';
import axios from 'axios';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const OwnerCouponsPanel: FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCoupons, setselectedCoupons] = useState<CouponDocumentWithId[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const batchModalDisclosure = useDisclosure();

  const couponsQuery = useQuery(['query:coupons'], async () => {

    const couponsSnap =
      await getDocs(collection(db, 'coupons').withConverter<CouponDocumentWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as Coupon)
          };
        },
        toFirestore: (doc: CouponDocumentWithId) => doc
      }))

    const coupons = couponsSnap.docs.map((d) => ({
      id: d.id,
      code: d.data().code,
      name: d.data().name,
      price: d.data().price,
      expiryDate: new Date(d.data().expiryDate).toLocaleString()
    }));

    return coupons;
  });

  const handleDeleteSelectedRows = async () => {
    setIsDeleting(true);

    try {
      await axios.post(`${process.env.REACT_APP_CLOUD_FUNCTIONS_URL}/manageCoupon`, {
        couponsToDelete: selectedCoupons,
        type: 'delete'
      });

      couponsQuery.refetch();

      setselectedCoupons([]);
      setIsDeleting(false);
      toast.success('Coupon(s) deleted');
    } catch (error) {
      console.error(error);
      toast.error('An error has occurred, try  again!');
    }
  };

  const getFilteredCoupons = useMemo(() => {
    return couponsQuery.data?.filter(
      (coupon) =>
        coupon.name.toLocaleLowerCase().match(searchInput.toLowerCase()) ||
        coupon.code.toLowerCase().match(searchInput.toLowerCase())
    );
  }, [couponsQuery.data, searchInput]);

  return (
    <ChakraFlex flexDirection="column">
      <ChakraFlex marginBottom="md" alignItems="center" justifyContent="space-between" gridGap="md">
        <ChakraFlex>
          <ChakraInputGroup width="340px" marginRight="md">
            <ChakraInput
              placeholder="Search Coupons"
              borderRadius="sm"
              value={searchInput}
              onChange={({ target }) => setSearchInput(target.value)}
            />
            <ChakraInputRightElement>
              <Icon size="sm" borderColor="gray.500" name="search" />
            </ChakraInputRightElement>
          </ChakraInputGroup>
        </ChakraFlex>
        <ChakraFlex gridGap="md">
          <ChakraButton
            borderRadius="sm"
            colorScheme="blue"
            leftIcon={<Icon name="small-add" />}
            onClick={() => batchModalDisclosure.onOpen()}
          >
            Add coupon
          </ChakraButton>
          <ChakraButton
            colorScheme="red"
            rightIcon={<Icon name="not-allowed" />}
            isLoading={isDeleting}
            isDisabled={!selectedCoupons?.length}
            onClick={() => handleDeleteSelectedRows()}
          >
            Delete ({selectedCoupons?.length}) coupons
          </ChakraButton>
        </ChakraFlex>
      </ChakraFlex>
      <CouponsPanelListing
        isLoading={couponsQuery.isLoading}
        data={getFilteredCoupons || []}
        onSelectRows={(rows) => setselectedCoupons(rows)}
      />

      <CouponsPanelAdd {...batchModalDisclosure} refetchCoupons={() => couponsQuery.refetch()} />
    </ChakraFlex>
  );
};
