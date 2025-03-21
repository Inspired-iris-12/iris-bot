
// This is a simple simulation of authentication for demonstration purposes
// In a real application, this would connect to a backend API

const LOCAL_STORAGE_AUTH_KEY = 'inspired_auth_token';
const DEV_EMAIL = 'dev@diyafahschool.com';
const DEV_OTP = '123456';

export const isAuthenticated = (): boolean => {
  const authToken = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
  return !!authToken;
};

export const sendOtp = async (email: string): Promise<boolean> => {
  // Development bypass - automatically "send" OTP for development email
  if (email === DEV_EMAIL) {
    console.log(`Development mode: OTP for ${DEV_EMAIL} is ${DEV_OTP}`);
    return true;
  }
  
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
  // Development bypass - automatically verify the development email with the preset OTP
  if (email === DEV_EMAIL && otp === DEV_OTP) {
    console.log('Development authentication successful');
    const mockToken = `dev_token_${Date.now()}`;
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, mockToken);
    return true;
  }
  
  // Simulate API call to verify OTP
  console.log(`Verifying OTP: ${otp} for ${email}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verify email domain and OTP format
  const isValidEmail = email.endsWith('@diyafahschool.com');
  const isValidOtp = otp.length === 6 && /^\d+$/.test(otp);
  
  const isValid = isValidEmail && isValidOtp;
  
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
  console.log("signOut function called in auth.ts");
  
  // Check what's in storage before removal
  console.log("Before removal - localStorage:", localStorage.getItem(LOCAL_STORAGE_AUTH_KEY));
  console.log("Before removal - sessionStorage:", sessionStorage.getItem(LOCAL_STORAGE_AUTH_KEY));
  
  // Clear both storages
  localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
  sessionStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
  
  // Also clear 'authData' key since it's used in your authform.tsx
  localStorage.removeItem('authData');
  sessionStorage.removeItem('authData');
  
  // Verify removal
  console.log("After removal - localStorage:", localStorage.getItem(LOCAL_STORAGE_AUTH_KEY));
  console.log("After removal - sessionStorage:", sessionStorage.getItem(LOCAL_STORAGE_AUTH_KEY));
  console.log("After removal - authData localStorage:", localStorage.getItem('authData'));
  console.log("After removal - authData sessionStorage:", sessionStorage.getItem('authData'));
}