import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const SubscriptionContext = createContext();

const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:5001' 
  : 'https://realeyes-final.onrender.com';

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

  const { token } = useContext(AuthContext);

  // Load status from DB whenever the auth token changes
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!token) return;

      try {
        const res = await axios.get(`${API_BASE}/api/subscription/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlan(res.data.plan);
        setSessionsUsed(res.data.sessionsUsed);
      } catch (err) {
        console.error("Failed to load subscription status from DB", err);
      }
    };

    fetchSubscription();

    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const storedMonth = localStorage.getItem(STORAGE_KEYS.billingMonth);

    if (storedMonth !== currentMonth) {
      localStorage.setItem(STORAGE_KEYS.billingMonth, currentMonth);
      localStorage.setItem(STORAGE_KEYS.sessionsUsed, '0');
      setSessionsUsed(0);
    }
  }, [token]);

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

  const consumeSession = useCallback(async () => {
    if (plan === 'premium') return true;
    if (sessionsUsed >= SESSIONS_LIMIT_BASIC) return false;
    
    setSessionsUsed((prev) => prev + 1);

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post(`${API_BASE}/api/subscription/consume`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to sync session consumption to DB", err);
      }
    }
    return true;
  }, [plan, sessionsUsed]);

  const upgradePlan = useCallback(async (newPlan) => {
    setPlan(newPlan);
    const token = localStorage.getItem('token');
    if (token && newPlan === 'premium') {
      try {
        await axios.post(`${API_BASE}/api/subscription/upgrade`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error("Failed to sync plan upgrade to DB", err);
      }
    }
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
