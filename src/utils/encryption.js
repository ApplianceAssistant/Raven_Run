// XOR encryption/decryption function
const xorEncryptDecrypt = (text, key) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
};

import { API_URL } from './utils';

// Get encryption key from server
let ENCRYPTION_KEY = 'MY_SECRET_ENCRYPTION_KEY';  // Default fallback
let keyInitialized = false;
let keyInitPromise = null;

// Function to initialize encryption key
const initializeEncryptionKey = async () => {
  if (keyInitPromise) return keyInitPromise;
  
  keyInitPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/server/config/config.php`);
      const config = await response.json();
      if (config.encryptionKey) {
        ENCRYPTION_KEY = config.encryptionKey;
        console.log('Encryption key loaded from server');
      }
    } catch (error) {
      console.warn('Using default encryption key:', error);
    } finally {
      keyInitialized = true;
    }
  })();
  
  return keyInitPromise;
};

// Initialize the key when the module loads
initializeEncryptionKey();

const safeBase64Encode = (str) => {
  try {
    return btoa(str);
  } catch (e) {
    console.error('Error in base64 encoding:', e);
    return '';
  }
};

const safeBase64Decode = (str) => {
  try {
    return atob(str);
  } catch (e) {
    console.error('Error in base64 decoding:', e);
    return '';
  }
};

export const encryptData = async (data) => {
  if (!keyInitialized) {
    await initializeEncryptionKey();
  }
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = xorEncryptDecrypt(jsonString, ENCRYPTION_KEY);
    const base64 = safeBase64Encode(encrypted);
    return base64;
  } catch (error) {
    console.error('Error encrypting data:', error);
    return '';
  }
};

export const decryptData = (encryptedData) => {
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