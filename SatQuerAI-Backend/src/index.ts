import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import systemRoutes from './routes/system';
import analyzeRoutes from './routes/analyze';
import scenesRoutes from './routes/scenes';
import reportsRoutes from './routes/reports';
import archiveRoutes from './routes/archive';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '5001', 10);

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Mount Routes
app.use('/api', analyzeRoutes);
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

const server = app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 SATQUERY AI TYPESCRIPT BACKEND LISTENING ON PORT: ${PORT}`);
  console.log(`🐘 POSTGRESQL DATABASE URL: ${process.env.DATABASE_URL || 'Not set'}`);
  console.log(`🛰️ COLAB MODEL API BRIDGE: ${process.env.COLAB_MODEL_URL || 'http://localhost:8000'}`);
  console.log(`==================================================\n`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${PORT} is currently occupied by a background process. Attempting automatic recovery...`);
    process.exit(1);
  } else {
    console.error(`❌ Server error:`, err);
  }
});
