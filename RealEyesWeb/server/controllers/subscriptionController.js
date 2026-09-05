import User from '../models/User.js';

/**
 * @desc    Get subscription status for current user
 * @route   GET /api/subscription/status
 * @access  Private
 */
export const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sessionsLimit = user.plan === 'premium' ? null : 20;
    const sessionsRemaining = user.plan === 'premium' ? null : Math.max(0, 20 - user.sessionsUsed);

    res.json({
      plan: user.plan,
      sessionsUsed: user.sessionsUsed,
      sessionsLimit,
      sessionsRemaining,
      billingCycleStart: user.billingCycleStart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Upgrade user plan (placeholder for Razorpay/Stripe webhook)
 * @route   POST /api/subscription/upgrade
 * @access  Private
 * 
 * In production, this would be called by a payment gateway webhook
 * after successful payment verification. For demo purposes, it
 * simply sets the plan to 'premium'.
 */
export const upgradePlan = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ─── PLACEHOLDER ──────────────────────────────────────
    // In production, verify payment here:
    //
    // Razorpay:
    //   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    //   const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    //
    // Stripe:
    //   const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    //   const session = event.data.object;
    // ──────────────────────────────────────────────────────

    user.plan = 'premium';
    user.billingCycleStart = new Date();
    user.sessionsUsed = 0;
    await user.save();

    res.json({
      message: 'Plan upgraded to premium',
      plan: user.plan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Consume one detection session
 * @route   POST /api/subscription/consume
 * @access  Private
 */
export const consumeSession = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.plan !== 'premium' && user.sessionsUsed >= 20) {
      return res.status(403).json({
        message: 'Monthly session limit reached. Upgrade to Premium for unlimited access.',
        limitReached: true,
      });
    }

    if (user.plan !== 'premium') {
      user.sessionsUsed += 1;
      await user.save();
    }

    res.json({
      sessionsUsed: user.sessionsUsed,
      sessionsRemaining: user.plan === 'premium' ? null : Math.max(0, 20 - user.sessionsUsed),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
