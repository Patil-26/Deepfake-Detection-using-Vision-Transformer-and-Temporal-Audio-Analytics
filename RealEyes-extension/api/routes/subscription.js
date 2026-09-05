import express from 'express';
import { getSubscriptionStatus, upgradePlan, consumeSession } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', protect, getSubscriptionStatus);
router.post('/upgrade', protect, upgradePlan);
router.post('/consume', protect, consumeSession);

export default router;
