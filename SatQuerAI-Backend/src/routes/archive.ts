import { Router, Request, Response } from 'express';
import { dbService } from '../db/db';

const router = Router();

// GET /api/archive
router.get('/', async (req: Request, res: Response) => {
  const { search, mode } = req.query as { search?: string; mode?: string };
  const archive = await dbService.getArchive(mode, search);

  res.json({
    status: 'success',
    total: archive.length,
    archive
  });
});

export default router;
