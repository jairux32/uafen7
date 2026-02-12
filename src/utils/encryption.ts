import crypto from 'crypto';
import config from '../config';

/**
 * Encryption service using AES-256-GCM
 * Used for encrypting sensitive data like ROS reports and documents
 */
export class EncryptionService {
    private algorithm: string;
    private key: Buffer;

    constructor() {
        this.algorithm = config.encryption.algorithm;
        // Ensure key is 32 bytes for AES-256
        this.key = crypto.scryptSync(config.encryption.key, 'salt', 32);
    }

    /**
     * Encrypt data
     * @param data - Plain text data to encrypt
     * @returns Encrypted data with IV and auth tag
     */
    encrypt(data: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as crypto.CipherGCM;

        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Return: iv:authTag:encrypted
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypt data
     * @param encryptedData - Encrypted data with IV and auth tag
     * @returns Decrypted plain text
     */
    decrypt(encryptedData: string): string {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv) as crypto.DecipherGCM;
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Hash data using SHA-256
     * @param data - Data to hash
     * @returns Hex-encoded hash
     */
    hash(data: string | Buffer): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Hash password using bcrypt (for user passwords)
     * @param password - Plain text password
     * @returns Hashed password
     */
    async hashPassword(password: string): Promise<string> {
        const bcrypt = await import('bcrypt');
        return bcrypt.hash(password, 10);
    }

    /**
     * Compare password with hash
     * @param password - Plain text password
     * @param hash - Hashed password
     * @returns True if password matches
     */
    async comparePassword(password: string, hash: string): Promise<boolean> {
        const bcrypt = await import('bcrypt');
        return bcrypt.compare(password, hash);
    }

    /**
     * Generate random token
     * @param length - Length in bytes (default 32)
     * @returns Hex-encoded random token
     */
    generateToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }
}

export const encryptionService = new EncryptionService();
