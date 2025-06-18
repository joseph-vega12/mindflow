import { createContext } from 'react';

import { UserWithDetails } from 'types';
type OptionalPromise<Type> = Promise<Type> | Type;
export interface AuthContextState {
  user?: UserWithDetails | null;
  isLogged: boolean;

  isLoading: boolean;
  refetchUserDetails: () => void;

  signIn: (email: string, password: string) => OptionalPromise<void>;

  signOut: () => OptionalPromise<void>;
  sendPasswordResetEmail: (email: string) => OptionalPromise<void>;
}

const AuthContext = createContext<AuthContextState>({
  user: null,
  isLogged: false,

  isLoading: false,
  refetchUserDetails: () => console.log('Refetch default'),

  signIn: console.log,
  signOut: () => console.log('Logout default'),

  sendPasswordResetEmail: () => console.log('Forgot password default')
});
AuthContext.displayName = 'AuthContext';

export { AuthContext };
