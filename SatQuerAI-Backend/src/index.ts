import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import os from 'os';

import systemRoutes from './routes/system';
import analyzeRoutes from './routes/analyze';
import scenesRoutes from './routes/scenes';
import reportsRoutes from './routes/reports';
import archiveRoutes from './routes/archive';
import authRoutes from './routes/auth';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5001', 10);
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Ensure upload directory exists safely
const uploadsDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(__dirname, '../uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn('⚠️ Notice: Upload directory creation skipped (read-only filesystem):', e);
}

// Middleware
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT || 120),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: true, message: 'Too many requests. Please try again later.' }
}));

// Mount Routes
app.use('/api', analyzeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/scenes', scenesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/archive', archiveRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'SatQuery AI TypeScript Express + PostgreSQL Backend',
    timestamp: new Date().toISOString()
  });
});
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'SatQuery AI TypeScript Express + PostgreSQL Backend',
    timestamp: new Date().toISOString()
  });
});

const startServer = (targetPort: number, maxRetries = 5, currentAttempt = 0) => {
  const server = app.listen(targetPort, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 SATQUERY AI TYPESCRIPT BACKEND LISTENING ON PORT: ${targetPort}`);
    console.log(`🛰️ COLAB MODEL API BRIDGE: ${process.env.COLAB_MODEL_URL ? 'configured' : 'not configured'}`);
    console.log(`==================================================\n`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      if (process.env.NODE_ENV === 'production') {
        console.error(`❌ Port ${targetPort} is already in use.`);
        process.exit(1);
      }
      if (currentAttempt < maxRetries) {
        console.warn(`⚠️ Port ${targetPort} is occupied. Retrying in 1.5 seconds... (Attempt ${currentAttempt + 1}/${maxRetries})`);
        setTimeout(() => {
          startServer(targetPort, maxRetries, currentAttempt + 1);
        }, 1500);
      } else {
        const nextPort = targetPort + 1;
        console.warn(`⚠️ Port ${targetPort} remains occupied. Falling back to port ${nextPort}...`);
        startServer(nextPort, 3, 0);
      }
    } else {
      console.error(`❌ Server error:`, err);
    }
  });

  const cleanup = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.once('SIGINT', cleanup);
  process.once('SIGTERM', cleanup);
};

app.use((err: any, req: Request, res: Response, next: Function) => {
  if (res.headersSent) return next(err);
  const statusCode = err.statusCode || (err.message?.includes('CORS') ? 403 : 400);
  res.status(statusCode).json({
    error: true,
    message: process.env.NODE_ENV === 'production' && statusCode >= 500
      ? 'Internal server error'
      : err.message || 'Request failed'
  });
});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  startServer(PORT);
}

export default app;

