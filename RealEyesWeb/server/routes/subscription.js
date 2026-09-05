import express from 'express';
import { getSubscriptionStatus, upgradePlan, consumeSession } from '../controllers/subscriptionController.js';

const router = express.Router();

// NOTE: These routes need auth middleware to populate req.user.
// For the demo, the client manages state via localStorage.
// When connecting to a real payment system, add your auth middleware here:
//   import { protect } from '../middleware/auth.js';
//   router.get('/status', protect, getSubscriptionStatus);

router.get('/status', getSubscriptionStatus);
router.post('/upgrade', upgradePlan);
router.post('/consume', consumeSession);

export default router;
