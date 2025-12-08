import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { connectDB } from './config/database.js';
import { config } from './config/config.js';
import { startPriceScheduler } from './schedulers/priceScheduler.js';
import { runImmediateHealthCheck, startHealthCheckScheduler } from './schedulers/healthCheckScheduler.js';

dotenv.config();

const app: Application = express();

connectDB();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: config.cors_origin || 'http://localhost:5173',
    credentials: true,

  })
);
setTimeout(() => {
    runImmediateHealthCheck();
  }, 5000); // Wait 5 seconds for server to be fully ready
  
  // Start schedulers
  startHealthCheckScheduler();
startPriceScheduler();
app.use('/api', routes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.use(notFound);
app.use(errorHandler);

export default app;
