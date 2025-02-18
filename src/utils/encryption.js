// XOR encryption/decryption function
const xorEncryptDecrypt = (text, key) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

// Get encryption key from environment
let ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || '8dd8017e03e2167c1d284e17e0a18930645aca97de65eb15e89ec0a2bc76251f';

// No need for async initialization since we're using environment variable
const keyInitialized = true;

const safeBase64Encode = (str) => {
  try {
    // Convert string to UTF-8 before base64 encoding
    const utf8Bytes = unescape(encodeURIComponent(str));
    return btoa(utf8Bytes);
  } catch (e) {
    console.error('Error in base64 encoding:', e);
    return '';
  }
};

const safeBase64Decode = (str) => {
  try {
    // Convert back from UTF-8 after base64 decoding
    const utf8Bytes = atob(str);
    return decodeURIComponent(escape(utf8Bytes));
  } catch (e) {
    console.error('Error in base64 decoding:', e);
    return '';
  }
};

export const encryptData = (data) => {
  if (!keyInitialized) {
    console.error('Encryption key not initialized');
    return null;
  }
  
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = xorEncryptDecrypt(jsonString, ENCRYPTION_KEY);
    const base64 = safeBase64Encode(encrypted);
    return base64;
  } catch (error) {
    console.error('Error encrypting data:', error);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  if (!keyInitialized) {
    console.error('Encryption key not initialized');
    return null;
  }
  
  if (!encryptedData) {
    console.warn('No data to decrypt');
    return null;
  }
  
  try {
    const decoded = safeBase64Decode(encryptedData);
    if (!decoded) return null;
    
    const decrypted = xorEncryptDecrypt(decoded, ENCRYPTION_KEY);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};