/**
 * Client-Side AES-GCM Password Encryption Engine using Web Crypto API.
 * Master password is never transmitted or stored remotely.
 */

// Derive an AES-GCM CryptoKey from a user master password using PBKDF2
export async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plaintext with master password
export async function encryptWithPassword(
  plainText: string,
  masterPassword: string
): Promise<{ encryptedData: string; iv: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(masterPassword, salt);
  const enc = new TextEncoder();
  
  const encryptedBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    enc.encode(plainText)
  );

  return {
    encryptedData: bufferToBase64(new Uint8Array(encryptedBuf)),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
  };
}

// Decrypt ciphertext with master password
export async function decryptWithPassword(
  encryptedDataBase64: string,
  ivBase64: string,
  saltBase64: string,
  masterPassword: string
): Promise<string> {
  const salt = base64ToBuffer(saltBase64);
  const iv = base64ToBuffer(ivBase64);
  const data = base64ToBuffer(encryptedDataBase64);
  
  const key = await deriveKeyFromPassword(masterPassword, salt);
  const decryptedBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    data as any
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuf);
}

// Helper: Uint8Array to Base64
function bufferToBase64(buf: Uint8Array): string {
  let binary = '';
  const len = buf.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary);
}

// Helper: Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate secure random password
export function generateSecurePassword(
  length: number = 16,
  options: { numbers?: boolean; symbols?: boolean; uppercase?: boolean; lowercase?: boolean } = {
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
  }
): string {
  const lowercaseChars = 'abcdefghjkmnpqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numberChars = '23456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let pool = '';
  let guaranteed = '';

  if (options.lowercase !== false) {
    pool += lowercaseChars;
    guaranteed += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  }
  if (options.uppercase) {
    pool += uppercaseChars;
    guaranteed += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  }
  if (options.numbers) {
    pool += numberChars;
    guaranteed += numberChars[Math.floor(Math.random() * numberChars.length)];
  }
  if (options.symbols) {
    pool += symbolChars;
    guaranteed += symbolChars[Math.floor(Math.random() * symbolChars.length)];
  }

  if (!pool) pool = lowercaseChars + numberChars;

  let result = guaranteed;
  const array = new Uint32Array(length - guaranteed.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < array.length; i++) {
    result += pool[array[i] % pool.length];
  }

  // Shuffle
  return result
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
