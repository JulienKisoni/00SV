import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import type { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: Options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Awesome App',
      version: '1.0.0',
    },
  },
  apis: ['../src/routes/'],
};

const specification = swaggerJsdoc(options);

export const swaggerDoc = (router: Router, _port?: number) => {
  // Swagger page
  router.use('/v1/api-docs', swaggerUi.serve);
  router.get('/v1/api-docs', swaggerUi.setup(specification));
};
