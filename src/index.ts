/// <reference path="./types/types.ts" />

import 'express-async-errors';

import path from 'path';
import dotenv from 'dotenv';
import http from 'http';
import { connect } from 'mongoose';

import { app } from './app';
import { seedDatabase } from '../__test__/helpers/index';

dotenv.config({ path: path.join(__dirname, '../.env') });

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
}

const init = async () => {
  const DATABASE_URI = process.env.DATABASE_URI;
  let DATABASE_NAME = process.env.DATABASE_NAME;
  if (process.env.TEST_ENABLED && process.env.TEST_ENABLED === 'true') {
    DATABASE_NAME = process.env.DATABASE_TEST_NAME;
  }
  const errMsg = `Could not connect to DB ${DATABASE_NAME}`;
  if (!DATABASE_URI || !DATABASE_NAME) {
    console.error(errMsg, DATABASE_NAME, DATABASE_URI);
    process.exit(1);
  }
  const connection_uri = `${DATABASE_URI}/${DATABASE_NAME}`;
  try {
    await connect(connection_uri);
    console.log(`Connected to DB ${DATABASE_NAME}`);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    if (process.env.TEST_ENABLED === 'true') {
      seedDatabase();
    }
  } catch (error) {
    console.error(error);
  }
};

init();
