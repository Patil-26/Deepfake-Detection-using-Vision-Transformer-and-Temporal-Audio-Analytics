import { createContext, useState, useEffect, useCallback } from 'react';

export const SubscriptionContext = createContext();

const SESSIONS_LIMIT_BASIC = 20;
const STORAGE_KEYS = {
  plan: 'dg_plan',
  sessionsUsed: 'dg_sessions_used',
  billingMonth: 'dg_billing_month',
};

export const SubscriptionProvider = ({ children }) => {
  const [plan, setPlan] = useState(() => localStorage.getItem(STORAGE_KEYS.plan) || 'basic');
  const [sessionsUsed, setSessionsUsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.sessionsUsed);
    return stored ? parseInt(stored, 10) : 0;
  });

  // Auto-reset sessions when the month changes
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const storedMonth = localStorage.getItem(STORAGE_KEYS.billingMonth);

    if (storedMonth !== currentMonth) {
      localStorage.setItem(STORAGE_KEYS.billingMonth, currentMonth);
      localStorage.setItem(STORAGE_KEYS.sessionsUsed, '0');
      setSessionsUsed(0);
    }
  }, []);

  // Persist plan changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.plan, plan);
  }, [plan]);

  // Persist session usage changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sessionsUsed, String(sessionsUsed));
  }, [sessionsUsed]);

  const sessionsLimit = plan === 'premium' ? Infinity : SESSIONS_LIMIT_BASIC;
  const sessionsRemaining = plan === 'premium' ? Infinity : Math.max(0, SESSIONS_LIMIT_BASIC - sessionsUsed);

  const canDetect = useCallback(() => {
    if (plan === 'premium') return true;
    return sessionsUsed < SESSIONS_LIMIT_BASIC;
  }, [plan, sessionsUsed]);

  const consumeSession = useCallback(() => {
    if (plan === 'premium') return true;
    if (sessionsUsed >= SESSIONS_LIMIT_BASIC) return false;
    setSessionsUsed((prev) => prev + 1);
    return true;
  }, [plan, sessionsUsed]);

  /**
   * Placeholder upgrade function.
   * In production, this would be called after a successful Razorpay/Stripe payment callback.
   * For the demo, it instantly sets the plan.
   */
  const upgradePlan = useCallback((newPlan) => {
    setPlan(newPlan);
  }, []);

  const resetMonthlyUsage = useCallback(() => {
    setSessionsUsed(0);
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        plan,
        sessionsUsed,
        sessionsLimit,
        sessionsRemaining,
        canDetect,
        consumeSession,
        upgradePlan,
        resetMonthlyUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
