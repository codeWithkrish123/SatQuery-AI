import { Router, Request, Response } from 'express';
import { dbService } from '../db/db';

const router = Router();

// GET /api/system/status
router.get('/status', (req: Request, res: Response) => {
  const status = dbService.getSystemStatus();
  res.json({
    ...status,
    timestamp: Date.now()
  });
});

export default router;
