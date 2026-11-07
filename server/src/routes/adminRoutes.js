import express from 'express';
import {
  adminLogin,
  adminVerify,
  getAdminStats,
  adminGenerateReferral,
  adminListReferrals,
} from '../controllers/analyticsController.js';
import { requireAdminAuth } from '../middleware/adminAuth.js';
import { adminLoginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Admin Authentication
router.post('/login', adminLoginLimiter, adminLogin);
router.get('/verify', requireAdminAuth, adminVerify);

// Protected Analytics Endpoints
router.get('/analytics/stats', requireAdminAuth, getAdminStats);

// Admin Referral Management
router.post('/referrals/generate', requireAdminAuth, adminGenerateReferral);
router.get('/referrals', requireAdminAuth, adminListReferrals);

export default router;
