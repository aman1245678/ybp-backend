import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from '../../config/index.js';

const bearerAuth = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
};

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: config.swagger.title,
      version: config.swagger.version,
      description:
        (config.swagger.description || '') +
        ' Auth + unified form submissions for mobile app and website.',
    },
    servers: [{ url: `http://localhost:${config.port}`, description: 'Local' }],
    components: {
      securitySchemes: { bearerAuth },
    },
    paths: {
      '/api/v1/ping': {
        get: {
          tags: ['Ping'],
          summary: 'Liveness / diagnostics',
          responses: { 200: { description: 'Service is healthy' } },
        },
      },
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check (includes DB)',
          responses: {
            200: { description: 'Healthy' },
            503: { description: 'Unhealthy' },
          },
        },
      },
      '/api/v1/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register (mobile / website)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['fullName', 'email', 'password'],
                  properties: {
                    fullName: { type: 'string', example: 'Aman Sharma' },
                    email: { type: 'string', example: 'aman@example.com' },
                    mobile: { type: 'string', example: '9876543210' },
                    password: { type: 'string', example: 'secret123' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Registered + tokens' }, 409: { description: 'Email exists' } },
        },
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Tokens + user' }, 401: { description: 'Invalid credentials' } },
        },
      },
      '/api/v1/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['refreshToken'],
                  properties: { refreshToken: { type: 'string' } },
                },
              },
            },
          },
          responses: { 200: { description: 'New tokens' } },
        },
      },
      '/api/v1/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Revoke refresh token',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { refreshToken: { type: 'string' } },
                },
              },
            },
          },
          responses: { 200: { description: 'Logged out' } },
        },
      },
      '/api/v1/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Current user',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'User profile' }, 401: { description: 'Unauthorized' } },
        },
      },
      '/api/v1/applications/types': {
        get: {
          tags: ['Applications'],
          summary: 'List 11 form types + codes',
          responses: { 200: { description: 'Form type catalog' } },
        },
      },
      '/api/v1/applications': {
        post: {
          tags: ['Applications'],
          summary: 'Submit hire/join form (sends confirmation email/SMS)',
          description:
            'Auth optional. If Bearer token present, links submission to user. Generates Application ID like YBP-BR-20260805-0001.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['formType', 'contactName', 'contactEmail'],
                  properties: {
                    formType: {
                      type: 'string',
                      enum: [
                        'BRANDING',
                        'CASTING_CREW',
                        'IT_SOLUTIONS',
                        'TRAINING',
                        'DIGITAL_MARKETING',
                        'SOCIAL_MEDIA',
                        'MANPOWER_HIRE',
                        'CREATIVE_CAREER',
                        'FILM_TV_TALENT',
                        'IT_CAREER',
                        'OFFICE_JOB',
                      ],
                    },
                    source: { type: 'string', enum: ['MOBILE', 'WEBSITE', 'ADMIN'], default: 'MOBILE' },
                    contactName: { type: 'string' },
                    contactEmail: { type: 'string' },
                    contactMobile: { type: 'string' },
                    companyName: { type: 'string' },
                    preferredCommunication: { type: 'array', items: { type: 'string' } },
                    payload: { type: 'object', description: 'Full wizard answers JSON' },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Application created + confirmation queued' } },
        },
      },
      '/api/v1/applications/by-code/{applicationId}': {
        get: {
          tags: ['Applications'],
          summary: 'Public status lookup by Application ID',
          parameters: [
            {
              name: 'applicationId',
              in: 'path',
              required: true,
              schema: { type: 'string', example: 'YBP-BR-20260805-0001' },
            },
          ],
          responses: { 200: { description: 'Status' }, 404: { description: 'Not found' } },
        },
      },
      '/api/v1/applications/mine': {
        get: {
          tags: ['Applications'],
          summary: 'Logged-in user applications',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List' }, 401: { description: 'Unauthorized' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);

/** Mount Swagger UI for API v1 (mirrors Asp.Versioning + Swashbuckle). */
export function mountSwagger(app) {
  app.use('/swagger/v1', swaggerUi.serveFiles(swaggerSpec), swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'YBP API v1',
  }));
  app.get('/swagger/v1/swagger.json', (_req, res) => res.json(swaggerSpec));
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Yashvi Bagga Productions API',
    swaggerOptions: {
      urls: [{ url: '/swagger/v1/swagger.json', name: 'V1' }],
    },
  }));
}
