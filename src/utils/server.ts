import http from 'http';
import { connect } from 'mongoose';

import { Application } from 'express';

function onError(error: { syscall: string; code: string }) {
  console.error('Error listening ', error);
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

export const startServer = async (port: string, app: Application): Promise<http.Server> => {
  const server = http.createServer(app);
  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    // if (process.env.TEST_ENABLED !== 'true') {
    console.info(`Server is listening on ${bind}`);
    // }
  }
  const DATABASE_URI = process.env.DATABASE_URI;
  let DATABASE_NAME = process.env.DATABASE_NAME;
  if (process.env.TEST_ENABLED && process.env.TEST_ENABLED === 'true') {
    if (process.env.LOAD_TEST_ENABLED === 'true') {
      DATABASE_NAME = process.env.DATABASE_LOAD_TEST_NAME;
    } else {
      DATABASE_NAME = process.env.DATABASE_TEST_NAME;
    }
  }
  const errMsg = 'Could not connect to DB';
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
  } catch (error) {
    console.error(error);
  } finally {
    return server;
  }
};
