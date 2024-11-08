import cluster from 'cluster';
import os from 'os';

const cpuCount = os.cpus().length;

console.log(`The total number of CPUs is ${cpuCount}`);
console.log(`Primary pid=${process.pid}`);
cluster.setupPrimary({
  exec: __dirname + '/index.ts',
});

for (let i = 0; i < cpuCount; i++) {
  cluster.fork();
}
cluster.on('exit', (worker) => {
  console.log(`worker ${worker.process.pid} has been killed`);
  console.log('Starting another worker');
  cluster.fork();
});
