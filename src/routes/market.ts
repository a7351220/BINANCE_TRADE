import express from 'express';
import { Router } from 'express';
import { getMarketData } from '../db/operations';

const router = Router();

// GET /api/market/history?from=2024-02-11T00:00:00Z&to=2024-02-11T01:00:00Z&limit=60
router.get('/history', async (req, res) => {
  try {
    const { from, to, limit } = req.query;
    
    // 驗證必要的參數
    if (!from || !to) {
      return res.status(400).json({ 
        error: 'Missing required parameters: from and to are required' 
      });
    }

    const data = await getMarketData({
      from: new Date(from as string),
      to: new Date(to as string),
      limit: limit ? Number(limit) : undefined
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

export default router; 