import { Router } from 'express';
import { getPortfolio, refresh } from '../controllers/portfolioController';

const router = Router();

router.get('/', getPortfolio);
router.get('/refresh', refresh);

export default router;
