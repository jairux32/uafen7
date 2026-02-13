import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VSInnfo API',
            version: '1.0.0',
            description: 'API Documentation for VSInnfo (Sistema de Prevención de Lavado de Activos)',
            contact: {
                name: 'VSInnfo Team',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Local Development Server',
            },
            {
                url: 'https://api.production.com/api',
                description: 'Production Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
