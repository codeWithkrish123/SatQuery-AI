import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { dbService, IScene } from '../db/db';

const router = Router();
const uploadDest = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, '../../uploads/');
const upload = multer({ dest: uploadDest });

// GET /api/scenes
router.get('/', async (req: Request, res: Response) => {
  const { category, type, search } = req.query as { category?: string; type?: string; search?: string };
  const targetCategory = category || type || 'All';
  const scenes = await dbService.getScenes(targetCategory, search);

  res.json({
    status: 'success',
    total: scenes.length,
    scenes
  });
});

// POST /api/scenes/upload
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  const { name, satellite, type, coordinates } = req.body;
  const newScene: IScene = {
    id: `SCN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name || 'Uploaded Satellite Scene',
    satellite: satellite || 'User Ingested / EOS-04',
    type: type || 'Optical',
    category: type || 'Optical',
    acquired: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    confidence: 99.0,
    status: 'ANALYZED',
    resolution: '2.5m',
    coordinates: coordinates || '28.6139° N, 77.2090° E',
    thumbnail: req.file
      ? `/uploads/${req.file.filename}`
      : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60'
  };

  const added = await dbService.addScene(newScene);
  res.json({
    status: 'success',
    message: 'Satellite scene successfully ingested into ISRO inventory',
    scene: added
  });
});

export default router;
