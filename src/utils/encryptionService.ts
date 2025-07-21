
/**
 * Enterprise-grade encryption service for secure data handling
 * Utilizes Web Crypto API for client-side encryption
 */
export class EncryptionService {
  private static instance: EncryptionService;
  private cryptoKey: CryptoKey | null = null;
  
  private constructor() {}
  
  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }
  
  /**
   * Initialize the encryption service with a derived key
   */
  public async initialize(masterPassword: string, salt?: Uint8Array): Promise<void> {
    // Generate salt if not provided
    if (!salt) {
      salt = window.crypto.getRandomValues(new Uint8Array(16));
    }
    
    // Convert password to key material
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);
    
    // Import key material
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    
    // Derive a key using PBKDF2
    this.cryptoKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  
  /**
   * Encrypt data using AES-GCM
   */
  public async encrypt(data: string): Promise<{
    ciphertext: string;
    iv: string;
  }> {
    if (!this.cryptoKey) {
      throw new Error("Encryption service not initialized");
    }
    
    // Generate initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Convert plaintext to buffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Encrypt data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      this.cryptoKey,
      dataBuffer
    );
    
    // Convert encrypted data to base64
    const ciphertextBase64 = btoa(
      String.fromCharCode(...new Uint8Array(encryptedBuffer))
    );
    
    // Convert IV to base64
    const ivBase64 = btoa(
      String.fromCharCode(...iv)
    );
    
    return {
      ciphertext: ciphertextBase64,
      iv: ivBase64
    };
  }
  
  /**
   * Decrypt data using AES-GCM
   */
  public async decrypt(ciphertext: string, iv: string): Promise<string> {
    if (!this.cryptoKey) {
      throw new Error("Encryption service not initialized");
    }
    
    // Convert base64 ciphertext to buffer
    const ciphertextBuffer = new Uint8Array(
      atob(ciphertext)
        .split("")
        .map(char => char.charCodeAt(0))
    );
    
    // Convert base64 IV to buffer
    const ivBuffer = new Uint8Array(
      atob(iv)
        .split("")
        .map(char => char.charCodeAt(0))
    );
    
    // Decrypt data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer
      },
      this.cryptoKey,
      ciphertextBuffer
    );
    
    // Convert decrypted data to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }
  
  /**
   * Hash sensitive data for storage or comparison
   */
  public async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Calculate SHA-256 hash
    const hashBuffer = await window.crypto.subtle.digest(
      "SHA-256",
      dataBuffer
    );
    
    // Convert hash to hex string
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
  
  /**
   * Generate a random key for use in secure operations
   */
  public generateRandomKey(length: number = 32): string {
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(length));
    return btoa(String.fromCharCode(...randomBytes));
  }
  
  /**
   * Reset the encryption service
   */
  public reset(): void {
    this.cryptoKey = null;
  }
}

export const encryptionService = EncryptionService.getInstance();
