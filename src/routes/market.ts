import express from 'express';
import { Router } from 'express';
import { getHistoricalData } from '../db/operations';

const router = Router();

// GET /api/market/history
router.get('/history', async (req, res) => {
  try {
    const { from, to, page = 1, limit = 100 } = req.query;
    const data = await getHistoricalData({
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit)
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

export default router; 