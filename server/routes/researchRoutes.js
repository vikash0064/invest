import express from 'express';
import {
  analyzeCompany,
  getHistory,
  deleteHistory,
  suggestStocks
} from '../controllers/researchController.js';

const router = express.Router();

// Define research routes
router.post('/analyze', analyzeCompany);
router.get('/history', getHistory);
router.delete('/history/:id', deleteHistory);
router.get('/suggest', suggestStocks);

export default router;
