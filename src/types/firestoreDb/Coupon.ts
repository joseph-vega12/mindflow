import { FirestoreDocumentWithId } from '..';

/* export const Coupons = {
  DOMINATE: { name: '10%-OFF', price: '132.30', expiryDate: 1705496583000 }, // 10% Percent OFF Coupon
  FunFriends2023: { name: '$10-OFF', price: '137.00', expiryDate: 1705496583000 }, // $10 OFF Coupon
  MBAchic: { name: '20%-OFF', price: '117.60', expiryDate: 1705496583000 }, // 20% Percent OFF Coupon
  MLTMBA24: { name: '$47-OFF', price: '100.00', expiryDate: 1705496583000 },
  JPSPTSO: { name: 'JPSPTSO', price: '147.00', expiryDate: 1705496583000 },
  '22Special': { name: '$22-OFF', price: '125.00', expiryDate: 1705410183000 }
}; */
export interface Coupon {
  code: string;
  name: string;
  price: number;
  expiryDate: string;
}
export type CouponDocumentWithId = FirestoreDocumentWithId<Coupon>;
