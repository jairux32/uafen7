import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import config from './config';
import logger from './config/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import operacionRoutes from './routes/operacion.routes';
import alertRoutes from './routes/alert.routes';
import reporteRoutes from './routes/reporte.routes';
import debidaDiligenciaRoutes from './routes/debidaDiligencia.routes';
import listasRestrictivasRoutes from './routes/listasRestrictivas.routes';
import documentoRoutes from './routes/documento.routes';
import usuarioRoutes from './routes/usuario.routes';
import adminRoutes from './routes/admin.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const app: Application = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS
app.use(
    cors({
        origin: config.corsOrigin,
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(
    morgan('combined', {
        stream: {
            write: (message) => logger.http(message.trim()),
        },
    })
);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde',
});

app.use('/api/', limiter);

// Passport initialization
app.use(passport.initialize());

// ============================================================================
// ROUTES
// ============================================================================

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/operaciones', operacionRoutes);
app.use('/api/alertas', alertRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/debida-diligencia', debidaDiligenciaRoutes);
app.use('/api/verificar-listas', listasRestrictivasRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
