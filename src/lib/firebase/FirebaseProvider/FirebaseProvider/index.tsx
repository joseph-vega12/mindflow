import React, { FC } from 'react';

import { auth, db, firestore, storage } from '../../firebaseInit';
import { FirebaseContext } from './FirebaseContext';

interface Props {}

export const FirebaseProvider: FC<Props> = ({ children }) => {
  return <FirebaseContext.Provider value={{ db, auth, firestore, storage }}>{children}</FirebaseContext.Provider>;
};
