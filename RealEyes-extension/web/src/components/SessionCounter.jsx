import { useContext } from 'react';
import { Activity, Infinity } from 'lucide-react';
import { SubscriptionContext } from '../context/SubscriptionContext';

export default function SessionCounter() {
  const { plan, sessionsUsed, sessionsRemaining } = useContext(SubscriptionContext);

  if (plan === 'premium') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deepRed/5 border border-deepRed/20 text-xs font-mono">
        <Infinity className="w-3.5 h-3.5 text-deepRed" />
        <span className="text-deepRed font-semibold">Unlimited Sessions</span>
        <span className="text-[10px] text-textMuted ml-1 uppercase tracking-wider">Premium</span>
      </div>
    );
  }

  const percentage = (sessionsUsed / 20) * 100;
  const isLow = sessionsRemaining <= 10;
  const isEmpty = sessionsRemaining === 0;

  return (
    <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg bg-deepCard border border-deepBorder text-xs font-mono">
      <Activity className={`w-3.5 h-3.5 ${isEmpty ? 'text-deepRed' : isLow ? 'text-yellow-500' : 'text-deepGreen'}`} />
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${isEmpty ? 'text-deepRed' : isLow ? 'text-yellow-500' : 'text-deepGreen'}`}>
          {sessionsRemaining} / 20
        </span>
        <span className="text-textMuted">Sessions Remaining</span>
      </div>
      <div className="w-16 h-1 bg-deepBase rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isEmpty ? 'bg-deepRed' : isLow ? 'bg-yellow-500' : 'bg-deepGreen'}`}
          style={{ width: `${Math.max(0, 100 - percentage)}%` }}
        />
      </div>
    </div>
  );
}
