import * as firebase from 'firebase';
import { createContext } from 'react';

export interface FirebaseContextProps {
  db: firebase.database.Database;
  firestore: firebase.firestore.Firestore;
  auth: firebase.auth.Auth;
  storage: firebase.storage.Storage;
}

const FirebaseContext = createContext<FirebaseContextProps>({} as FirebaseContextProps);
FirebaseContext.displayName = 'FirebaseContext';

export { FirebaseContext };
