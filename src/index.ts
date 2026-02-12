import app from './app';
import config from './config';
import logger from './config/logger';
import { connectRedis, disconnectDatabases, prisma } from './config/database';

const PORT = config.port;
const HOST = config.host;

/**
 * Start server
 */
async function startServer() {
    try {
        // Connect to Redis
        await connectRedis();
        logger.info('✅ Redis connection established');

        // Test database connection
        await prisma.$connect();
        logger.info('✅ Database connection established');

        // Start Express server
        const server = app.listen(PORT, HOST, () => {
            logger.info(`🚀 VSinnfo server running on http://${HOST}:${PORT}`);
            logger.info(`📝 Environment: ${config.nodeEnv}`);
            logger.info(`🔐 API Mocks: ${config.useApiMocks ? 'ENABLED' : 'DISABLED'}`);
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received, shutting down gracefully...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await disconnectDatabases();
                    logger.info('Database connections closed');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown', { error });
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught errors
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception', { error });
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled Rejection', { reason, promise });
            process.exit(1);
        });
    } catch (error) {
        logger.error('Failed to start server', { error });
        process.exit(1);
    }
}

// Start the server
startServer();
