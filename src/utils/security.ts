/**
 * Security utilities for session management, encryption, and token generation
 */

// Generate a dynamic encryption key from browser fingerprint + timestamp
const generateEncryptionKey = (): string => {
  const userAgent = navigator.userAgent;
  const screenResolution = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fingerprint = `${userAgent}-${screenResolution}-${timezone}`;
  
  // Create a base key from fingerprint
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  
  // Simple hash function (not cryptographic, just for obfuscation)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString(36).padStart(16, '0');
};

// Encryption key (generated once per session)
let ENCRYPTION_KEY: string | null = null;

const getEncryptionKey = (): string => {
  if (!ENCRYPTION_KEY) {
    ENCRYPTION_KEY = generateEncryptionKey();
  }
  return ENCRYPTION_KEY;
};

/**
 * Simple XOR-based encryption for sessionStorage
 * Not military-grade but sufficient for preventing casual tampering
 */
export const encryptData = (data: string): string => {
  const key = getEncryptionKey();
  let encrypted = '';
  
  for (let i = 0; i < data.length; i++) {
    const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode);
  }
  
  return btoa(encrypted); // Base64 encode
};

export const decryptData = (encryptedData: string): string => {
  try {
    const key = getEncryptionKey();
    const decoded = atob(encryptedData); // Base64 decode
    let decrypted = '';
    
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};

/**
 * Generate HMAC-SHA256 checksum for data integrity
 */
export const generateChecksum = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const keyBuffer = encoder.encode(getEncryptionKey());
  
  // Import key for HMAC
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Generate signature
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Verify checksum
 */
export const verifyChecksum = async (data: string, checksum: string): Promise<boolean> => {
  const calculatedChecksum = await generateChecksum(data);
  return calculatedChecksum === checksum;
};

/**
 * Generate UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * Generate booking reference (AR-YEAR-XXXX)
 */
export const generateBookingReference = (): string => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: 0, O, I, 1
  let random = '';
  
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < 4; i++) {
    random += chars[array[i] % chars.length];
  }
  
  return `AR-${year}-${random}`;
};

/**
 * Generate secure magic link token (32 bytes)
 */
export const generateMagicToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash token with SHA-256 for storage
 */
export const hashToken = async (token: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Sanitize filename for upload
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove path traversal attempts
  const basename = filename.replace(/^.*[\\\/]/, '');
  
  // Remove dangerous characters
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Generate random prefix to prevent collisions
  const randomPrefix = Math.random().toString(36).substring(2, 10);
  
  return `${randomPrefix}_${sanitized}`;
};

/**
 * Validate file type (client-side)
 */
export const validateFileType = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPG, PNG, and GIF are allowed.' };
  }
  
  // Check extension
  const extension = file.name.toLowerCase().match(/\.[^.]*$/)?.[0];
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'Invalid file extension.' };
  }
  
  // Check file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB.' };
  }
  
  return { valid: true };
};

/**
 * Calculate expiry date (return date + 24 hours)
 */
export const calculateExpiryDate = (returnDate: string): Date => {
  const date = new Date(returnDate);
  date.setHours(date.getHours() + 24);
  return date;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (expiryDate: string | Date): boolean => {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  return new Date() > expiry;
};
