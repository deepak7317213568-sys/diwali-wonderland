import express from 'express';
import {
  createOrGetReferral,
  lookupReferral,
  updateReferrerName,
  recordReferralVisit,
  qualifyReferral,
  getReferralStats,
} from '../controllers/referralController.js';
import { referralActionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/create', referralActionLimiter, createOrGetReferral);
router.get('/lookup/:code', lookupReferral);
router.post('/update-name', referralActionLimiter, updateReferrerName);
router.post('/visit', referralActionLimiter, recordReferralVisit);
router.post('/qualify', referralActionLimiter, qualifyReferral);
router.get('/stats/:code', getReferralStats);

export default router;
