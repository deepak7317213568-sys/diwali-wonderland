import express from 'express';
import { recordVisit, recordEvent } from '../controllers/analyticsController.js';
import { analyticsLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public tracking endpoints
router.post('/visit', analyticsLimiter, recordVisit);
router.post('/event', analyticsLimiter, recordEvent);

export default router;
