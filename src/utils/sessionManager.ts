/**
 * Session storage manager with encryption and validation
 */

import { encryptData, decryptData, generateChecksum, verifyChecksum, generateUUID } from './security';
import type { Car } from '../types';

export type BookingStep = 'browse' | 'booking' | 'checkout' | 'submitted';

export interface SearchCriteria {
  pickupLocation: string;
  pickupDate: string;
  returnDate: string;
  startTime: string;
  deliveryMethod?: 'pickup' | 'delivery';
}

export interface RenterInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  driversLicense: string;
}

export interface SessionData {
  sessionId: string;
  step: BookingStep;
  searchCriteria: SearchCriteria | null;
  vehicle: Car | null;
  renterInfo: RenterInfo | null;
  driveOption: 'self-drive' | 'with-driver' | null;
  agreedToTerms: boolean;
  timestamp: number;
  checksum: string;
}

const SESSION_KEY = 'ar_booking_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Initialize a new session
 */
export const initSession = (): string => {
  const sessionId = generateUUID();
  const sessionData: SessionData = {
    sessionId,
    step: 'browse',
    searchCriteria: null,
    vehicle: null,
    renterInfo: null,
    driveOption: null,
    agreedToTerms: false,
    timestamp: Date.now(),
    checksum: ''
  };
  
  saveSession(sessionData);
  return sessionId;
};

/**
 * Save session data with encryption
 */
export const saveSession = async (data: Partial<SessionData>): Promise<void> => {
  try {
    const existingData = getSession();
    const updatedData: SessionData = {
      ...existingData,
      ...data,
      timestamp: Date.now()
    };
    
    // Generate checksum
    const dataString = JSON.stringify({
      ...updatedData,
      checksum: '' // Exclude checksum from checksum calculation
    });
    updatedData.checksum = await generateChecksum(dataString);
    
    // Encrypt and store
    const encrypted = encryptData(JSON.stringify(updatedData));
    sessionStorage.setItem(SESSION_KEY, encrypted);
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

/**
 * Get session data with decryption and validation
 */
export const getSession = (): SessionData => {
  try {
    const encrypted = sessionStorage.getItem(SESSION_KEY);
    if (!encrypted) {
      return getDefaultSession();
    }
    
    const decrypted = decryptData(encrypted);
    if (!decrypted) {
      clearSession();
      return getDefaultSession();
    }
    
    const data: SessionData = JSON.parse(decrypted);
    
    // Check session timeout
    if (Date.now() - data.timestamp > SESSION_TIMEOUT) {
      clearSession();
      return getDefaultSession();
    }
    
    // Verify checksum
    const dataString = JSON.stringify({
      ...data,
      checksum: ''
    });
    
    verifyChecksum(dataString, data.checksum).then(isValid => {
      if (!isValid) {
        console.warn('Session data integrity check failed');
        clearSession();
      }
    });
    
    return data;
  } catch (error) {
    console.error('Failed to get session:', error);
    clearSession();
    return getDefaultSession();
  }
};

/**
 * Clear session
 */
export const clearSession = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};

/**
 * Check if session is valid
 */
export const isSessionValid = (): boolean => {
  const session = getSession();
  return !!session.sessionId && Date.now() - session.timestamp <= SESSION_TIMEOUT;
};

/**
 * Validate step progression
 */
export const canAccessStep = (requestedStep: BookingStep): boolean => {
  const session = getSession();
  
  const stepOrder: BookingStep[] = ['browse', 'booking', 'checkout', 'submitted'];
  const currentStepIndex = stepOrder.indexOf(session.step);
  const requestedStepIndex = stepOrder.indexOf(requestedStep);
  
  // Can only access current step or previous steps
  return requestedStepIndex <= currentStepIndex;
};

/**
 * Update current step
 */
export const updateStep = async (step: BookingStep): Promise<void> => {
  await saveSession({ step });
};

/**
 * Get default session
 */
const getDefaultSession = (): SessionData => ({
  sessionId: generateUUID(),
  step: 'browse',
  searchCriteria: null,
  vehicle: null,
  renterInfo: null,
  driveOption: null,
  agreedToTerms: false,
  timestamp: Date.now(),
  checksum: ''
});

/**
 * Helper to update search criteria
 */
export const updateSearchCriteria = async (criteria: SearchCriteria): Promise<void> => {
  await saveSession({ searchCriteria: criteria });
};

/**
 * Helper to update vehicle
 */
export const updateVehicle = async (vehicle: Car): Promise<void> => {
  await saveSession({ vehicle, step: 'booking' });
};

/**
 * Helper to update renter info
 */
export const updateRenterInfo = async (info: RenterInfo): Promise<void> => {
  await saveSession({ renterInfo: info });
};

/**
 * Helper to update drive option
 */
export const updateDriveOption = async (option: 'self-drive' | 'with-driver'): Promise<void> => {
  await saveSession({ driveOption: option });
};

/**
 * Helper to mark terms as agreed
 */
export const agreeToTerms = async (): Promise<void> => {
  await saveSession({ agreedToTerms: true, step: 'checkout' });
};

/**
 * Check if all required data for checkout is present
 */
export const canProceedToCheckout = (): boolean => {
  const session = getSession();
  return !!(
    session.searchCriteria &&
    session.vehicle &&
    session.renterInfo &&
    session.driveOption &&
    session.agreedToTerms
  );
};

/**
 * Get session data for a specific step
 */
export const getStepData = <T extends keyof SessionData>(key: T): SessionData[T] => {
  const session = getSession();
  return session[key];
};
