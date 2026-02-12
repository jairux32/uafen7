import { encryptionService } from '../../src/utils/encryption';

describe('EncryptionService', () => {
    describe('encrypt and decrypt', () => {
        it('should encrypt and decrypt data correctly', () => {
            const plainText = 'Información confidencial de reporte ROS';

            const encrypted = encryptionService.encrypt(plainText);
            expect(encrypted).not.toBe(plainText);
            expect(encrypted).toContain(':'); // Should have format iv:authTag:encrypted

            const decrypted = encryptionService.decrypt(encrypted);
            expect(decrypted).toBe(plainText);
        });

        it('should produce different ciphertext for same plaintext', () => {
            const plainText = 'Same data';

            const encrypted1 = encryptionService.encrypt(plainText);
            const encrypted2 = encryptionService.encrypt(plainText);

            expect(encrypted1).not.toBe(encrypted2); // Different IV each time
            expect(encryptionService.decrypt(encrypted1)).toBe(plainText);
            expect(encryptionService.decrypt(encrypted2)).toBe(plainText);
        });

        it('should handle special characters and unicode', () => {
            const plainText = 'Datos con ñ, tildes áéíóú, y símbolos: $10,000 USD';

            const encrypted = encryptionService.encrypt(plainText);
            const decrypted = encryptionService.decrypt(encrypted);

            expect(decrypted).toBe(plainText);
        });

        it('should throw error for invalid encrypted data', () => {
            expect(() => {
                encryptionService.decrypt('invalid-data');
            }).toThrow();
        });
    });

    describe('hash', () => {
        it('should generate consistent hash for same input', () => {
            const data = 'Test data for hashing';

            const hash1 = encryptionService.hash(data);
            const hash2 = encryptionService.hash(data);

            expect(hash1).toBe(hash2);
            expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
        });

        it('should generate different hashes for different inputs', () => {
            const hash1 = encryptionService.hash('data1');
            const hash2 = encryptionService.hash('data2');

            expect(hash1).not.toBe(hash2);
        });

        it('should handle Buffer input', () => {
            const buffer = Buffer.from('Test buffer data');
            const hash = encryptionService.hash(buffer);

            expect(hash).toHaveLength(64);
        });
    });

    describe('hashPassword and comparePassword', () => {
        it('should hash password and verify correctly', async () => {
            const password = 'SecurePassword123!';

            const hashed = await encryptionService.hashPassword(password);
            expect(hashed).not.toBe(password);
            expect(hashed).toMatch(/^\$2[aby]\$/); // bcrypt format

            const isValid = await encryptionService.comparePassword(password, hashed);
            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const password = 'CorrectPassword';
            const wrongPassword = 'WrongPassword';

            const hashed = await encryptionService.hashPassword(password);
            const isValid = await encryptionService.comparePassword(wrongPassword, hashed);

            expect(isValid).toBe(false);
        });

        it('should generate different hashes for same password', async () => {
            const password = 'SamePassword';

            const hash1 = await encryptionService.hashPassword(password);
            const hash2 = await encryptionService.hashPassword(password);

            expect(hash1).not.toBe(hash2); // Different salt each time

            // But both should verify correctly
            expect(await encryptionService.comparePassword(password, hash1)).toBe(true);
            expect(await encryptionService.comparePassword(password, hash2)).toBe(true);
        });
    });

    describe('generateToken', () => {
        it('should generate random token of default length', () => {
            const token = encryptionService.generateToken();

            expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
            expect(token).toMatch(/^[0-9a-f]+$/); // Only hex characters
        });

        it('should generate token of custom length', () => {
            const token = encryptionService.generateToken(16);

            expect(token).toHaveLength(32); // 16 bytes = 32 hex characters
        });

        it('should generate different tokens each time', () => {
            const token1 = encryptionService.generateToken();
            const token2 = encryptionService.generateToken();

            expect(token1).not.toBe(token2);
        });
    });
});
