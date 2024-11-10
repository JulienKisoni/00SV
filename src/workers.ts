import cluster from 'cluster';
import os from 'os';

import Logger from './utils/logger';

const cpuCount = os.cpus().length;

Logger.warning(`The total number of CPUs is ${cpuCount}`);
Logger.info(`Primary pid=${process.pid}`);

cluster.setupPrimary({
  exec: __dirname + '/index.ts',
});

for (let i = 0; i < cpuCount; i++) {
  cluster.fork();
}
cluster.on('exit', (worker) => {
  Logger.error(`worker ${worker.process.pid} has been killed`);
  Logger.info('Starting another worker');
  cluster.fork();
});
