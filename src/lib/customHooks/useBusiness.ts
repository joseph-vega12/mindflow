import _ from 'lodash';

import { toast } from 'react-toastify';
import { useAuthContext } from 'lib/firebase';
import { useParams } from 'react-router-dom';
import { useQuery, UseQueryResult } from 'react-query';

import {
  Business,
  BusinessDocumentWithId,
  ELicenseType,
  License,
  LicenseDocumentWithId,
  TestResult,
  TestResultWithId,
  UserDetails,
  UserDetailsWithId
} from 'types';

import { useFirebaseContext } from 'lib/firebase';
import { useLicenses } from './useLicenses';
import { collection, doc, DocumentData, getDoc, getDocs, limit, query, where, WithFieldValue } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

interface UseBusinessReturn {
  // TODO: PASS IN CORESPONDING TYPES
  businessUsersQuery: any;
  businessQuery: UseQueryResult<BusinessDocumentWithId | null>;
  businessId: string;
  businessTestResults: any;
  businessLicensesQuery: any;
}

export const useBusiness = (): UseBusinessReturn => {
  const { licensesQuery } = useLicenses();

  const { firestore } = useFirebaseContext();
  const { businessId } = useParams<{ businessId?: string }>();
  const { user } = useAuthContext();

  const businessQuery = useQuery(
    ['business', businessId],
    async () => {
      const canAccess = await _.find(licensesQuery.data, { businessId, type: ELicenseType.BUSINESS_OWNER });

      if (!canAccess) {
        throw new Error('You do not have access to this business');
      }

      const businessDocRef = doc(collection(db, "business"), businessId).withConverter<BusinessDocumentWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as Business)
          };
        },
        toFirestore: (doc: Business) => doc
      })


      const businessSnap = await getDoc(businessDocRef)

      const userBusiness = businessSnap.data();
      return userBusiness as BusinessDocumentWithId | null;
    },
    {
      refetchOnMount: false,
      enabled: !!businessId && licensesQuery.isSuccess,
      onError: (err: Error) => {
        toast.error(err?.message);
        console.error(err);
      }
    }
  );

  const businessLicensesQuery = useQuery(
    ['business', 'licenses'],
    async () => {
      const licenseRef = collection(db, "licenses");

      const licenseQuery = query(
        licenseRef,
        where('businessId', '==', businessId),
      ).withConverter<LicenseDocumentWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as License)
          };
        },
        toFirestore: (doc: LicenseDocumentWithId) => {
          return { ...doc };
        },
      })

      const licenseSnap = await getDocs(licenseQuery);

      const licenseResults = licenseSnap.docs.map((doc) => doc.data());

      return licenseResults;

    },
    {
      enabled: businessQuery.isSuccess,
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  const businessUsersQuery = useQuery(
    ['business', user?.uid, 'users'],
    async () => {
      const usersRef = collection(db, "users")

      const usersQuery = query(
        usersRef,
        where("businessId", "==", businessId)
      )
        .withConverter<UserDetailsWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as UserDetails)
            };
          },
          toFirestore: (doc: UserDetailsWithId) => doc
        })
      limit(100)

      const usersSnap = await getDocs(usersQuery);

      const users = usersSnap.docs.map((doc) => doc.data());

      return users;
    },
    {
      enabled: businessQuery.isSuccess,
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  const businessTestResults = useQuery(
    ['business', user?.uid, 'testResults'],
    async () => {
      const testResultsRef = collection(db, 'testResults')

      const testResultsQuery = query(testResultsRef,
        where("businessId", "==", businessQuery.data?.id),
        where("type", "!=", "practice"),
        limit(50)
      ).withConverter<TestResultWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as TestResult)
          };
        },
        toFirestore: (doc: TestResultWithId) => doc
      })

      const testResultsSnap = await getDocs(testResultsQuery)

      const testResults = testResultsSnap.docs.map((doc) => doc.data());

      return testResults;
    },
    {
      enabled: businessQuery.isSuccess,
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  return {
    businessId,
    businessQuery,
    businessUsersQuery,
    businessLicensesQuery,
    businessTestResults
  };
};
