
// This is a simple simulation of authentication for demonstration purposes
// In a real application, this would connect to a backend API

const LOCAL_STORAGE_AUTH_KEY = 'inspired_auth_token';

export const isAuthenticated = (): boolean => {
  const authToken = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
  return !!authToken;
};

export const sendOtp = async (email: string): Promise<boolean> => {
  // Simulate API call to send OTP
  console.log(`OTP would be sent to ${email} in a real application`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, always return success
  return true;
};

export const verifyOtp = async (
  email: string, 
  otp: string, 
  rememberMe: boolean
): Promise<boolean> => {
  // Simulate API call to verify OTP
  console.log(`Verifying OTP: ${otp} for ${email}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demo purposes, we'll accept any 6-digit OTP
  const isValid = otp.length === 6 && /^\d+$/.test(otp);
  
  if (isValid) {
    // Store authentication token
    const mockToken = `demo_token_${Date.now()}`;
    
    if (rememberMe) {
      localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, mockToken);
    } else {
      // Use session storage instead if not "remember me"
      sessionStorage.setItem(LOCAL_STORAGE_AUTH_KEY, mockToken);
    }
  }
  
  return isValid;
};

export const signOut = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
  sessionStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
};
