import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
    // Server
    port: number;
    host: string;
    nodeEnv: string;

    // Database
    databaseUrl: string;

    // Redis
    redis: {
        host: string;
        port: number;
        password?: string;
    };

    // JWT
    jwt: {
        secret: string;
        expiresIn: string;
    };

    // API Configuration
    useApiMocks: boolean;

    // External APIs
    uafe: {
        apiUrl: string;
        apiKey?: string;
    };

    ofac: {
        apiUrl: string;
        apiKey?: string;
    };

    un: {
        apiUrl: string;
    };

    // File Storage
    storage: {
        path: string;
        maxFileSize: number;
    };

    // Encryption
    encryption: {
        key: string;
        algorithm: string;
    };

    // Logging
    logging: {
        level: string;
        file: string;
    };

    // Email
    email: {
        smtp: {
            host: string;
            port: number;
            user: string;
            password: string;
        };
        from: string;
    };

    // Cloud Backup
    cloudBackup: {
        enabled: boolean;
        provider: string;
        aws?: {
            accessKeyId: string;
            secretAccessKey: string;
            region: string;
            s3Bucket: string;
        };
    };
}

const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',

    databaseUrl: process.env.DATABASE_URL || '',

    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'change-me-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },

    useApiMocks: process.env.USE_API_MOCKS === 'true',

    uafe: {
        apiUrl: process.env.UAFE_API_URL || 'https://api.uafe.gob.ec',
        apiKey: process.env.UAFE_API_KEY,
    },

    ofac: {
        apiUrl: process.env.OFAC_API_URL || 'https://api.treasury.gov/ofac',
        apiKey: process.env.OFAC_API_KEY,
    },

    un: {
        apiUrl: process.env.UN_API_URL || 'https://scsanctions.un.org/api',
    },

    storage: {
        path: process.env.STORAGE_PATH || './storage',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
    },

    encryption: {
        key: process.env.ENCRYPTION_KEY || 'change-me-32-chars-encryption-key',
        algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
    },

    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/vsinnfo.log',
    },

    email: {
        smtp: {
            host: process.env.SMTP_HOST || '',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            user: process.env.SMTP_USER || '',
            password: process.env.SMTP_PASSWORD || '',
        },
        from: process.env.SMTP_FROM || 'noreply@vsinnfo.com',
    },

    cloudBackup: {
        enabled: process.env.CLOUD_BACKUP_ENABLED === 'true',
        provider: process.env.CLOUD_PROVIDER || 's3',
        aws: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            region: process.env.AWS_REGION || 'us-east-1',
            s3Bucket: process.env.AWS_S3_BUCKET || 'vsinnfo-backups',
        },
    },
};

// Validation
if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is required');
}

if (config.nodeEnv === 'production') {
    if (config.jwt.secret === 'change-me-in-production') {
        throw new Error('JWT_SECRET must be changed in production');
    }

    if (config.encryption.key === 'change-me-32-chars-encryption-key') {
        throw new Error('ENCRYPTION_KEY must be changed in production');
    }
}

export default config;
