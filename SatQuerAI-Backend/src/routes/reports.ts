import { Router, Request, Response } from 'express';
import { dbService } from '../db/db';

const router = Router();

// GET /api/reports
router.get('/', (req: Request, res: Response) => {
  const data = dbService.getReports();
  res.json({
    status: 'success',
    data
  });
});

// GET /api/reports/pdf
router.get('/pdf', (req: Request, res: Response) => {
  const data = dbService.getReports();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="SatQuery_AI_Analysis_Report.json"');
  res.send(JSON.stringify(data, null, 2));
});

export default router;
