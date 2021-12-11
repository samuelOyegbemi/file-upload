import fs from 'fs';
import path from 'path';
import cluster from 'cluster';
import os from 'os';
import express from 'express';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import ResponseTime from 'response-time';
import FileStream from 'file-stream-rotator';
import swaggerUi from 'swagger-ui-express';
import chalk from 'chalk';
import mongoose from 'mongoose';
import {
  logger,
  errorHandler,
  getEnv,
  preloadSwagger,
  NotFoundError,
  response,
  normalizePort,
} from '@wbc-nodejs/core';
import router from './src/routes';
import swaggerDoc from './src/docs/swagger.json';
import { convertToBoolean } from './src/helpers/utility';
import corsOptions from './src/config/cors';

const { NODE_ENV, PORT, ENABLE_CLUSTERING, MONGODB_URL } = getEnv();
const numberOfCPU = os.cpus().length;

let httpLogger;
const inProduction = NODE_ENV === 'production';
const logDirectory = path.join(__dirname, 'logs');
// ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

if (inProduction) {
  // create a rotating write stream
  const accessLogStream = FileStream.getStream({
    date_format: 'YYYY-MM-DD',
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daily',
    verbose: false,
  });
  httpLogger = morgan('combined', { stream: accessLogStream });
} else {
  httpLogger = morgan('dev', { stream: logger.stream });
}

if (convertToBoolean(ENABLE_CLUSTERING) && (cluster.isPrimary || cluster.isMaster)) {
  logger.info(chalk.green(`Number of CPUs is ${numberOfCPU}`));
  logger.info(chalk.green(`Master ${process.pid} is running`));

  // Fork workers.
  for (let i = 0; i < numberOfCPU; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.info(chalk.green(`worker${worker.process.pid} exited: code ${code}, signal ${signal}`));
    cluster.fork();
  });
} else {
  const app = express();
  let appPort = PORT || '5100';

  appPort = normalizePort(appPort);
  mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  // eslint-disable-next-line no-console
  db.on('error', console.error.bind(console, 'DB connection error: '));
  db.once('open', () => {
    logger.info(chalk.green('Connected to db successfully!'));
  });
  // security configuration
  app.use(helmet());
  app.use(helmet.hidePoweredBy());
  app.use(ResponseTime());
  app.use(httpLogger);
  app.use(cookieParser());
  app.use(express.static('public', { maxAge: 172800000 })); // two days 2 * 24 * 60 * 60 * 1000
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  app.use('/docs', preloadSwagger(swaggerDoc), swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  app.get('/', (req, res) => response.redirect(res, '/docs'));
  app.use('/api/v1', router);

  app.use('*', req => {
    throw new NotFoundError(`Method [${req.method}] not found for route [${req.originalUrl}]`);
  });

  app.use(errorHandler(!inProduction));

  app.listen(appPort, () => {
    logger.info(chalk.green(`Server listening on PORT:${appPort}`));
  });

  process.on('SIGINT', () => {
    logger.info('Shutting down server...');
    process.exit();
  });
}
