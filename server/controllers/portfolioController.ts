import { Request, Response } from 'express';
import { getCachedPortfolio, refreshPortfolio } from '../services/portfolioService';

export async function getPortfolio(req: Request, res: Response) {
  try {
    const data = await getCachedPortfolio();
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'failed to fetch portfolio' });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const data = await refreshPortfolio();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'failed to refresh' });
  }
}
