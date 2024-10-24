/// <reference path="./types/types.ts" />

import 'express-async-errors';

import createError from 'http-errors';
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
import { connect } from 'mongoose';

import httpLogger from './middlewares/httpLogger';
import { validateToken } from './middlewares/validateToken';
import router from './routes/index';
import { errorHandler } from './middlewares/errors';
import { swaggerDoc } from '../swagger';

dotenv.config({ path: path.join(__dirname, '../.env') });

const app: express.Application = express();

app.use(httpLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(validateToken);
app.use('/', router);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404));
});

app.use(errorHandler);

const port = process.env.PORT || '8000';
app.set('port', port);

const server = http.createServer(app);

function onError(error: { syscall: string; code: string }) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      process.exit(1);
      break;
    case 'EADDRINUSE':
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
  console.info(`Server is listening on ${bind}`);
  swaggerDoc(router);
}

const init = async () => {
  const DATABASE_URI = process.env.DATABASE_URI;
  const DATABASE_NAME = process.env.DATABASE_NAME;
  const errMsg = 'Could not connect to DB';
  if (!DATABASE_URI || !DATABASE_NAME) {
    console.error(errMsg, DATABASE_NAME, DATABASE_URI);
    process.exit(1);
  }
  const connection_uri = `${DATABASE_URI}/${DATABASE_NAME}`;
  try {
    await connect(connection_uri);
    console.log('Connected to DB');
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
  } catch (error) {
    console.error(error);
  }
};

init();
