import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import httpLogger from './middlewares/httpLogger';
import { validateToken } from './middlewares/validateToken';
import router from './routes/index';
import { errorHandler } from './middlewares/errors';
import { generateSwaggerDoc } from '../swagger';

const app: express.Application = express();

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const swaggerDoc = generateSwaggerDoc();
app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(validateToken);
app.use('/', router);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404));
});

app.use(errorHandler);

export { app };
