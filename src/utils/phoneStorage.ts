// Phone number storage utilities for future SMS functionality

export interface PhoneData {
  phoneNumber: string;
  verified: boolean;
  userId?: string;
}

/**
 * Store user's phone number for future SMS functionality
 */
export const storeUserPhone = (phoneNumber: string, userId?: string): void => {
  try {
    const phoneData: PhoneData = {
      phoneNumber,
      verified: true,
      userId,
    };
    
    localStorage.setItem('userPhoneData', JSON.stringify(phoneData));
  } catch (error) {
    console.warn('Failed to store phone number:', error);
  }
};

/**
 * Retrieve user's phone number for SMS functionality
 */
export const getUserPhone = (): PhoneData | null => {
  try {
    const phoneData = localStorage.getItem('userPhoneData');
    return phoneData ? JSON.parse(phoneData) : null;
  } catch (error) {
    console.warn('Failed to retrieve phone number:', error);
    return null;
  }
};

/**
 * Check if user has a verified phone number
 */
export const hasVerifiedPhone = (): boolean => {
  const phoneData = getUserPhone();
  return phoneData?.verified === true && !!phoneData?.phoneNumber;
};

/**
 * Get the user's phone number for SMS sending
 */
export const getPhoneForSMS = (): string | null => {
  const phoneData = getUserPhone();
  return phoneData?.verified ? phoneData.phoneNumber : null;
};

/**
 * Clear phone number data (useful for logout)
 */
export const clearPhoneData = (): void => {
  try {
    localStorage.removeItem('userPhoneData');
  } catch (error) {
    console.warn('Failed to clear phone data:', error);
  }
};

/**
 * Update phone number (useful for profile updates)
 */
export const updateUserPhone = (newPhoneNumber: string): void => {
  const currentData = getUserPhone();
  if (currentData) {
    storeUserPhone(newPhoneNumber, currentData.userId);
  }
}; 