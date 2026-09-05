import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Check, Zap, Crown, Sparkles, Star, ArrowRight, X } from 'lucide-react';
import { SubscriptionContext } from '../context/SubscriptionContext';
import { AuthContext } from '../context/AuthContext';
import clsx from 'clsx';

const basicFeatures = [
  '20 Detection Sessions per month',
  'AI Image Detection',
  'Deepfake Image Detection',
  'AI Video Detection',
  'Standard Detection Speed',
  'Basic Detection Report',
  'Email Support',
];

const premiumFeatures = [
  'Unlimited Detection Sessions',
  'Faster Detection Speed',
  'More Detailed Detection Reports',
  'Priority Support',
  'Early Access to New Features',
];

const comparisonRows = [
  { feature: 'Monthly Sessions', basic: '20', premium: 'Unlimited' },
  { feature: 'AI Image Detection', basic: true, premium: true },
  { feature: 'AI Video Detection', basic: true, premium: true },
  { feature: 'Deepfake Detection', basic: true, premium: true },
  { feature: 'Detection Speed', basic: 'Standard', premium: 'Faster' },
  { feature: 'Detection Report', basic: 'Basic', premium: 'Detailed' },
  { feature: 'Support', basic: 'Email', premium: 'Priority' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { plan, upgradePlan } = useContext(SubscriptionContext);

  const handleGetStarted = () => {
    if (!user) {
      navigate('/signup');
    } else {
      upgradePlan('basic');
      navigate('/detect-image');
    }
  };

  const handleUpgrade = () => {
    // ───────────────────────────────────────────────
    // PLACEHOLDER: Replace with Razorpay/Stripe flow
    // Example Razorpay integration point:
    //
    // const options = {
    //   key: 'rzp_test_...',
    //   amount: 89900, // ₹899 in paise
    //   currency: 'INR',
    //   name: 'Deepguard AI',
    //   description: 'Premium Plan',
    //   handler: (response) => {
    //     upgradePlan('premium');
    //     navigate('/detect-image');
    //   },
    // };
    // const rzp = new window.Razorpay(options);
    // rzp.open();
    // ───────────────────────────────────────────────

    upgradePlan('premium');
    navigate('/detect-image');
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen">

      {/* ── Hero Section ── */}
      <div className="relative w-full flex flex-col items-center pt-24 pb-16 px-4">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-deepRed/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-deepBorder bg-deepCard mb-6 shadow-[0_0_15px_rgba(30,30,30,0.5)]">
            <Sparkles className="w-3.5 h-3.5 text-deepRed" />
            <span className="text-xs font-mono text-textMuted uppercase tracking-wider">Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold uppercase tracking-tight mb-4">
            Choose Your <span className="text-deepRed glow-text-red">Plan</span>
          </h1>
          <p className="text-lg text-textMuted max-w-xl mx-auto">
            Start detecting deepfakes for free. Upgrade for unlimited sessions, faster processing, and priority support.
          </p>
        </div>
      </div>

      {/* ── Pricing Cards ── */}
      <div className="w-full max-w-5xl px-6 pb-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

        {/* ─── Basic Card ─── */}
        <div className="relative glass-panel p-8 flex flex-col border border-deepBorder hover:border-deepBorder/80 transition-all duration-300 group">
          {/* Current plan badge */}
          {plan === 'basic' && user && (
            <div className="absolute -top-3 left-6 px-3 py-1 bg-deepCard border border-deepBorder rounded-full text-[10px] font-mono text-textMuted uppercase tracking-wider">
              Current Plan
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-deepCard border border-deepBorder">
                <Shield className="w-6 h-6 text-textMuted" />
              </div>
              <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Basic</h2>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-display font-bold text-white">Free</span>
            </div>
            <p className="text-sm text-textMuted">
              Perfect for students, startups, and small HR teams.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-deepBorder mb-8" />

          {/* Features */}
          <ul className="space-y-4 flex-1 mb-8">
            {basicFeatures.map((feat, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 p-0.5 rounded-full bg-deepGreen/10 border border-deepGreen/20 flex-shrink-0">
                  <Check className="w-3 h-3 text-deepGreen" />
                </div>
                <span className="text-gray-300">{feat}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handleGetStarted}
            className="w-full py-3.5 rounded-xl border border-deepBorder bg-deepCard text-white font-semibold text-sm uppercase tracking-wider hover:bg-deepBase hover:border-textMuted transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Get Started
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* ─── Premium Card ─── */}
        <div className="relative glass-panel p-8 flex flex-col border border-deepRed/30 hover:border-deepRed/60 transition-all duration-300 group shadow-[0_0_40px_rgba(255,42,42,0.08)] hover:shadow-[0_0_60px_rgba(255,42,42,0.15)]">
          {/* Popular badge */}
          <div className="absolute -top-3 right-6 px-4 py-1 bg-deepRed/10 border border-deepRed/30 rounded-full flex items-center gap-1.5">
            <Star className="w-3 h-3 text-deepRed fill-deepRed" />
            <span className="text-[10px] font-mono text-deepRed uppercase tracking-wider font-bold">Popular</span>
          </div>

          {/* Current plan badge */}
          {plan === 'premium' && user && (
            <div className="absolute -top-3 left-6 px-3 py-1 bg-deepRed/10 border border-deepRed/30 rounded-full text-[10px] font-mono text-deepRed uppercase tracking-wider font-bold">
              Current Plan
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-deepRed/10 border border-deepRed/30">
                <Crown className="w-6 h-6 text-deepRed" />
              </div>
              <h2 className="text-2xl font-display font-bold uppercase tracking-wider">Premium</h2>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-display font-bold text-white">₹899</span>
              <span className="text-textMuted text-sm font-mono">/month</span>
            </div>
            <p className="text-sm text-textMuted">
              Designed for organizations with higher verification needs.
            </p>
            <p className="text-[11px] text-textMuted/60 font-mono mt-1 italic">Demo Price</p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-deepRed/20 mb-8" />

          {/* Features — includes everything in Basic */}
          <div className="mb-3">
            <span className="text-[10px] font-mono text-textMuted uppercase tracking-wider">Everything in Basic, plus:</span>
          </div>
          <ul className="space-y-4 flex-1 mb-8">
            {premiumFeatures.map((feat, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5 p-0.5 rounded-full bg-deepRed/10 border border-deepRed/20 flex-shrink-0">
                  <Zap className="w-3 h-3 text-deepRed" />
                </div>
                <span className="text-gray-300">{feat}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handleUpgrade}
            disabled={plan === 'premium'}
            className={clsx(
              "w-full py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300",
              plan === 'premium'
                ? "bg-deepCard border border-deepBorder text-textMuted cursor-default"
                : "bg-deepRed/10 border border-deepRed text-deepRed hover:bg-deepRed hover:text-white hover:glow-red"
            )}
          >
            {plan === 'premium' ? (
              <>
                <Check className="w-4 h-4" /> Active
              </>
            ) : (
              <>
                <Crown className="w-4 h-4" /> Upgrade Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Comparison Table ── */}
      <div className="w-full max-w-4xl px-6 pb-24">
        <div className="text-center mb-12">
          <p className="text-xs text-textMuted uppercase tracking-wider font-mono mb-2">Feature Matrix</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold">
            Plan <span className="text-deepRed glow-text-red">Comparison</span>
          </h2>
        </div>

        <div className="glass-panel overflow-hidden border border-deepBorder">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-deepBorder">
                <th className="text-left py-4 px-6 font-mono text-xs text-textMuted uppercase tracking-wider">Feature</th>
                <th className="text-center py-4 px-6 font-mono text-xs text-textMuted uppercase tracking-wider">Basic</th>
                <th className="text-center py-4 px-6 font-mono text-xs text-deepRed uppercase tracking-wider">Premium</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={i}
                  className={clsx(
                    "border-b border-deepBorder/50 transition-colors hover:bg-deepCard/50",
                    i === comparisonRows.length - 1 && "border-b-0"
                  )}
                >
                  <td className="py-4 px-6 text-gray-300 font-medium">{row.feature}</td>
                  <td className="py-4 px-6 text-center">
                    {typeof row.basic === 'boolean' ? (
                      <Check className="w-4 h-4 text-deepGreen mx-auto" />
                    ) : (
                      <span className="text-textMuted font-mono text-xs">{row.basic}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {typeof row.premium === 'boolean' ? (
                      <Check className="w-4 h-4 text-deepGreen mx-auto" />
                    ) : (
                      <span className="text-white font-mono text-xs font-semibold">{row.premium}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom note */}
        <div className="text-center mt-8">
          <p className="text-xs text-textMuted font-mono">
            All plans include full access to AI Image, Video, and Deepfake Detection engines.
          </p>
        </div>
      </div>
    </div>
  );
}
