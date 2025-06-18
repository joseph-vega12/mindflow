import { filter, get, groupBy, uniqBy } from 'lodash';
import { useContext } from 'react';

import { AuthContext, AuthContextState } from './AuthProvider/AuthContext';
import { FirebaseContext, FirebaseContextProps } from './FirebaseProvider/FirebaseProvider/FirebaseContext';
import { FirestoreDocumentWithId, TestResultWithId, UserTestType } from 'types';

export * from './storage';

export const useAuthContext = (): AuthContextState => {
  return useContext(AuthContext);
};

const defaultTypes: UserTestType[] = ['brain-eye-coordination', 'practice', 'speed-read'];
export const useTestResultList = <TestInterface = TestResultWithId>(
  types: UserTestType[]
): (FirestoreDocumentWithId<TestInterface> & TestResultWithId)[] => {
  const { user } = useContext(AuthContext);

  const userCategory = user?.userDetails?.difficultLevel;
  const resultsGroupedByType = groupBy(user?.testResults ?? [], 'type');
  let filteredTypes = types.length ? types : defaultTypes;

  const result = [];
  for (const type of filteredTypes) {
    const results = uniqBy(resultsGroupedByType[type], 'essayId');
    const filteredResults = results.filter((result) => {
      // @ts-ignore
      if (result.isCustomText) return true;
      return userCategory === result.category;
    });
    result.push(...filteredResults);
  }

  return result;
};

export const useFirebaseContext = (): FirebaseContextProps => {
  return useContext(FirebaseContext);
};
