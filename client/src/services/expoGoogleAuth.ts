import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
  User,
} from '@react-native-google-signin/google-signin';

import { useAlert } from '../contexts/AlertContext';

GoogleSignin.configure({
  webClientId: '6131617190-7797mobvlvi97nq8dusnhl59eeb30jat.apps.googleusercontent.com',
  iosClientId: '6131617190-olimslmumk2f3jm801fdun6ejp1q5glt.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  offlineAccess: true,
});

export const useGoogleAuth = () => {
  
  const { showSuccess, showError } = useAlert();

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        showSuccess('Google Sign In', 'Sign in successful');
        return response.data;
      } else {
        return null;
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            showError('Google Sign In', 'Sign in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showError('Google Sign In', 'Play services not available or outdated');
            break;
          default:
            showError('Google Sign In', 'Something went wrong during sign in');
        }
      } else {
        showError('Google Sign In', 'An error occurred');
      }
      console.error('Google Sign In Error:', error);
      return null;
    }
  };

  const signOutGoogle = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign Out Error:', error);
    }
  };

  return {
    signInWithGoogle,
    signOutGoogle,
  };
};
