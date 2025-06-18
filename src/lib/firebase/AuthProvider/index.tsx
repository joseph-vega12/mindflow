import React, { FC, useEffect, useState } from 'react';
import moment from 'moment';

import { auth, db } from "lib/firebase/firebaseInit";
import { collection, doc, getDoc, getDocs, updateDoc, where, limit, query, WithFieldValue, DocumentData } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

import { toast } from 'react-toastify';
import { useQuery } from 'react-query';

import { TestResult, TestResultWithId, UserDetails, UserWithDetails } from 'types';

import { PageLoading } from 'components/common';

import { AuthContext } from './AuthContext';
import { useFirebaseContext } from '../index';

import { Box } from '@chakra-ui/react';

interface Props { }

export const AuthProvider: FC<Props> = ({ children }) => {
  const [firebaseInitialized, setFirebaseInitialized] = useState<boolean>(false);
  // const [firebaseAuthUser, setFirebaseAuthUser] = useState<User | null>(null);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState(null);
  const { firestore } = useFirebaseContext();

  // const navigate = useNavigate();
  // const isLoginPage = useMatch('/login');
  // const isPencilLoginPage = useMatch('/pencilSpacesLogin');
  // const isFreeSpeedReadPage = useMatch('/free/speed-read');
  // const isProgramPage = useMatch('/free/program') || useMatch('/free/buy-program');

  const { data: user, refetch, isLoading, isFetching, error } = useQuery<UserWithDetails | null>(
    ['user'],
    async () => {
      if (!firebaseAuthUser) return null;

      const userDetailsDocRef = doc(collection(db, 'users'), firebaseAuthUser.uid);
      const userDetailsSnap = await getDoc(userDetailsDocRef);

      const userDetails = userDetailsSnap.data() as UserDetails;

      if (!userDetails) return null;

      if (!userDetails.lastSeen || moment().diff(moment(userDetails.lastSeen, 'x'), 'hour') > 1) {
        await updateDoc(doc(collection(db, 'users'), firebaseAuthUser.uid), { lastSeen: +new Date() })
      }

      const difficultLevel = userDetails?.difficultLevel;

      const testResultsRef = collection(firestore, 'testResults');

      const testResultsQuery = query(
        testResultsRef,
        where('category', '==', difficultLevel),
        where('user.id', '==', firebaseAuthUser?.uid),
        limit(150),
      ).withConverter<TestResultWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as TestResult),
          }
        },
        toFirestore: (doc: TestResultWithId): WithFieldValue<DocumentData> => {
          return { ...doc } as WithFieldValue<DocumentData>;
        },
      })

      const testResultsQuerySnapshot = await getDocs(testResultsQuery);
      const testResults: TestResultWithId[] = testResultsQuerySnapshot.docs.map((doc) => doc.data());

      return {
        ...firebaseAuthUser,
        userDetails,
        testResults
      };
    },
    {
      cacheTime: 15000,
      keepPreviousData: false,
      refetchOnWindowFocus: false,
      enabled: !!firebaseInitialized && !!firebaseAuthUser,
      onSettled(userResp) {
        if (!userResp) {
          // navigate(isPencilLoginPage ? '/pencilSpacesLogin' : '/login');
        } else {
          // if (isLoginPage || isPencilLoginPage) {
          // navigate('/');
          // }
        }
      }
    }
  );

  useEffect(() => {
    // if (firebaseInitialized && !isFreeSpeedReadPage && !isProgramPage) {
    //   if (firebaseAuthUser && isLoginPage) push('/');
    // if (!firebaseAuthUser) navigate(isPencilLoginPage ? '/pencilSpacesLogin' : '/login');
    // }
  }, [firebaseInitialized, firebaseAuthUser]);

  useEffect(() => {
    const unlisten = auth.onAuthStateChanged((authUser) => {
      setFirebaseAuthUser(authUser ?? null);

      // The initialization must come after the authUser
      setFirebaseInitialized(true);
    });

    return () => {
      unlisten();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      await refetch();
    } catch (e) {
      // @ts-ignore
      toast.error(e);
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await sendPasswordResetEmail(email);
    } catch (e) {
      // @ts-ignore
      toast.error(e);
    }
  };

  if (error) {
    return <Box>Unauthorized</Box>;
  }

  return (
    <PageLoading isLoading={!firebaseInitialized || isLoading}>
      <AuthContext.Provider
        value={{
          user,
          isLoading: isLoading || isFetching,
          isLogged: !!user,
          refetchUserDetails: refetch,
          signOut,
          sendPasswordResetEmail,
          signIn
        }}
      >
        {children}
      </AuthContext.Provider>
    </PageLoading>
  );
};
