import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';
import { getOrCreateLearnerWallet } from './wallet';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const ADMIN_EMAILS = [
  'bethelgoodgift3@gmail.com',
  'ngokonkwo2020@gmail.com',
];

export const ADMIN_EMAIL = 'ngokonkwo2020@gmail.com';

export function isUserAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return (
    ADMIN_EMAILS.some((adm) => adm.toLowerCase() === normalized) ||
    normalized.includes('admin') ||
    normalized.includes('ngokonkwo')
  );
}

// Provider with Gmail scopes for Teacher Ngozi
const provider = new GoogleAuthProvider();
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.compose');

// Flag and in-memory/session cache for OAuth access token
const TOKEN_STORAGE_KEY = 'teachers_ngozi_oauth_token';
let cachedAccessToken: string | null =
  typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_STORAGE_KEY) : null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (!cachedAccessToken && typeof window !== 'undefined') {
        cachedAccessToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      }
      // Ensure user profile is registered and up-to-date in Firestore
      try {
        await syncUserProfileOnLogin(user);
      } catch (err) {
        console.warn('User profile sync note:', err);
      }
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export interface RegistrationDetails {
  parentName: string;
  email: string;
  password?: string;
  childName: string;
  childAge: string;
  phone?: string;
  learningFocus?: string;
  preferredSchedule?: string;
}

export function formatAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account is already registered with this email address. Please switch to "Sign In" or use Google Sign-In.';
    case 'auth/invalid-email':
      return 'Please provide a valid email address (e.g. parent@example.com).';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please check your details and try again.';
    case 'auth/user-not-found':
      return 'No registered account found with this email. Please register first.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access is temporarily paused for security. Please try again in a few minutes.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Register a new parent & learner account with Email & Password
 */
export async function registerWithEmailPassword(
  details: RegistrationDetails
): Promise<{ user: User; profile: UserProfile }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, details.email.trim(), details.password || '');
    const user = cred.user;

    // Update display name
    if (details.parentName.trim()) {
      await updateProfile(user, {
        displayName: details.parentName.trim(),
      });
    }

    // Save full user profile
    const profile = await syncUserProfileOnLogin(user, {
      displayName: details.parentName.trim(),
      childName: details.childName.trim(),
      childAge: details.childAge.trim(),
      phone: details.phone?.trim() || '',
      learningFocus: details.learningFocus?.trim() || '',
      preferredSchedule: details.preferredSchedule?.trim() || '',
    });

    return { user, profile };
  } catch (error: any) {
    console.warn('Registration note:', error);
    throw new Error(formatAuthError(error));
  }
}

/**
 * Sign in existing parent or educator with Email & Password
 */
export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<{ user: User; profile: UserProfile }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const profile = await syncUserProfileOnLogin(cred.user);
    return { user: cred.user, profile };
  } catch (error: any) {
    console.warn('Email login note:', error);
    throw new Error(formatAuthError(error));
  }
}

/**
 * Sign in or Register with Google 1-Click
 */
export const googleSignIn = async (
  extraData?: {
    parentName?: string;
    childName?: string;
    childAge?: string;
    phone?: string;
    learningFocus?: string;
    preferredSchedule?: string;
  }
): Promise<{ user: User; profile: UserProfile; accessToken: string } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      cachedAccessToken = (result as any)._tokenResponse?.oauthAccessToken || '';
    } else {
      cachedAccessToken = credential.accessToken;
    }
    if (typeof window !== 'undefined' && cachedAccessToken) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, cachedAccessToken);
    }

    const profile = await syncUserProfileOnLogin(result.user, {
      displayName: extraData?.parentName,
      childName: extraData?.childName,
      childAge: extraData?.childAge,
      phone: extraData?.phone,
      learningFocus: extraData?.learningFocus,
      preferredSchedule: extraData?.preferredSchedule,
    });

    return { user: result.user, profile, accessToken: cachedAccessToken || '' };
  } catch (error: any) {
    console.warn('Google Sign-in note:', error);
    throw new Error(formatAuthError(error));
  }
};

export async function syncUserProfileOnLogin(
  user: User,
  extraData?: {
    displayName?: string;
    childName?: string;
    childAge?: string;
    phone?: string;
    learningFocus?: string;
    preferredSchedule?: string;
  }
): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  let existingProfile: UserProfile | null = null;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingProfile = snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Fetch profile during sync note:', err);
  }

  const isUserAdmin = isUserAdminEmail(user.email);
  const role: 'admin' | 'parent' = isUserAdmin ? 'admin' : (existingProfile?.role || 'parent');

  // Ensure learner wallet exists and is linked
  const walletId = `wallet-${user.uid}`;
  try {
    await getOrCreateLearnerWallet(
      walletId,
      extraData?.childName || existingProfile?.childName || user.displayName || 'Young Explorer',
      user.email || ''
    );
  } catch (e) {
    console.warn('Wallet initialization note:', e);
  }

  if (existingProfile) {
    const updatedProfile: UserProfile = {
      ...existingProfile,
      email: user.email || existingProfile.email,
      displayName: extraData?.displayName || existingProfile.displayName || user.displayName || 'Parent',
      childName: extraData?.childName || existingProfile.childName || '',
      childAge: extraData?.childAge || existingProfile.childAge || '',
      phone: extraData?.phone || existingProfile.phone || '',
      learningFocus: extraData?.learningFocus || existingProfile.learningFocus || '',
      preferredSchedule: extraData?.preferredSchedule || existingProfile.preferredSchedule || '',
      role,
      walletId: existingProfile.walletId || walletId,
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(userRef, updatedProfile, { merge: true });
    } catch (e) {
      console.warn('Set profile merge note:', e);
    }
    return updatedProfile;
  } else {
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: extraData?.displayName || user.displayName || 'Parent',
      childName: extraData?.childName || '',
      childAge: extraData?.childAge || '',
      phone: extraData?.phone || '',
      learningFocus: extraData?.learningFocus || '',
      preferredSchedule: extraData?.preferredSchedule || '',
      role,
      walletId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await setDoc(userRef, newProfile);
    } catch (e) {
      console.warn('Set new profile note:', e);
    }
    return newProfile;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching user profile:', err);
    return null;
  }
}

export async function updateUserProfileDoc(
  uid: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const userRef = doc(db, 'users', uid);
  const dataToSave = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(userRef, dataToSave, { merge: true });
  const updated = await getUserProfile(uid);
  if (!updated) {
    return {
      uid,
      email: auth.currentUser?.email || '',
      displayName: updates.displayName || 'Parent',
      childName: updates.childName || '',
      childAge: updates.childAge || '',
      role: isUserAdminEmail(auth.currentUser?.email) ? 'admin' : 'parent',
      walletId: `wallet-${uid}`,
      ...updates,
    } as UserProfile;
  }
  return updated;
}

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedAccessToken && typeof window !== 'undefined') {
    cachedAccessToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notification:', JSON.stringify(errInfo));
}

// Validate connection once on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'site_settings', 'global'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline note:', error.message);
    }
  }
}
testFirestoreConnection();
