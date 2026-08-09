import React, { useState } from 'react';
import { X, Zap, Check, ShieldCheck, Sparkles, CreditCard, Lock, ArrowRight, Gift, PartyPopper } from 'lucide-react';
import { CreditState, addCredits } from '../utils/creditManager';
import { motion, AnimatePresence } from 'motion/react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditState: CreditState;
  setCreditState: (state: CreditState) => void;
}

interface PlanTier {
  id: string;
  name: string;
  price: string;
  creditsText: string;
  creditAmount: number;
  popular?: boolean;
  badge?: string;
  description: string;
  features: string[];
  ctaText: string;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  creditState,
  setCreditState,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [paymentStep, setPaymentStep] = useState<'tiers' | 'checkout' | 'success'>('tiers');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gpay' | 'apple'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardHolder, setCardHolder] = useState('Alex Morgan');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');

  const plans: PlanTier[] = [
    {
      id: 'free',
      name: 'Free Daily Pass',
      price: '$0',
      creditsText: '5 Credits / Day',
      creditAmount: 0,
      description: 'Default daily allowance for casual AI tools exploration.',
      features: [
        '5 Free Credits auto-refreshed every 24h',
        'Access to AI Chat & Prompt Generator',
        'Standard server response speed',
        'Local outputs saved in browser',
      ],
      ctaText: 'Current Active Plan',
    },
    {
      id: 'starter',
      name: 'Starter Pack',
      price: '$4.99',
      creditsText: '50 Credits Pack',
      creditAmount: 50,
      badge: 'Great Value',
      description: 'Ideal for occasional creators needing quick AI tasks.',
      features: [
        '50 Bonus Credits added instantly',
        'No monthly expiration date',
        'Access to all 7+ AI Tools',
        'Faster response priority',
        'Copy & Export formatted outputs',
      ],
      ctaText: 'Buy 50 Credits ($4.99)',
    },
    {
      id: 'pro',
      name: 'Pro Creator Pack',
      price: '$12.99',
      creditsText: '200 Credits Pack',
      creditAmount: 200,
      popular: true,
      badge: 'Most Popular',
      description: 'Power up your creative workflow with massive credit reserves.',
      features: [
        '200 Bonus Credits added instantly',
        'Never expires, stackable balance',
        'Gemini 3.6 Flash ultra-speed engine',
        'Unlimited Prompt Library saves',
        'Priority 24/7 server access',
      ],
      ctaText: 'Buy 200 Credits ($12.99)',
    },
    {
      id: 'unlimited',
      name: 'Unlimited Power Pass',
      price: '$29.99/mo',
      creditsText: '500 Instant Credits + Daily Pass',
      creditAmount: 500,
      badge: 'Best Power',
      description: 'For professionals, marketers, and power prompt engineers.',
      features: [
        '500 Credits added immediately',
        'Daily free reset boosted to 25/day',
        'Gemini 3.1 Pro reasoning engine access',
        'Priority customer support',
        'Custom AI tool template creator',
      ],
      ctaText: 'Get Power Pass ($29.99)',
    },
  ];

  if (!isOpen) return null;

  const handleSelectPlan = (plan: PlanTier) => {
    if (plan.id === 'free') {
      onClose();
      return;
    }
    setSelectedPlan(plan);
    setPaymentStep('checkout');
  };

  const handleCompletePurchase = () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const updated = addCredits(
        creditState,
        selectedPlan.creditAmount,
        `Purchased ${selectedPlan.name} (+${selectedPlan.creditAmount} Credits)`,
        'purchase'
      );
      setCreditState(updated);
      setPaymentStep('success');
    }, 1200);
  };

  const handleClaimFreeDemoBonus = () => {
    const updated = addCredits(
      creditState,
      5,
      'Claimed Demo Top-Up Bonus (+5 Credits)',
      'bonus'
    );
    setCreditState(updated);
    setPaymentStep('success');
    setSelectedPlan({
      id: 'demo-bonus',
      name: 'Demo Free Top-Up',
      price: '$0.00',
      creditsText: '5 Demo Credits',
      creditAmount: 5,
      description: 'Free instant demo top-up for testing.',
      features: [],
      ctaText: 'Claimed',
    });
  };

  const resetModal = () => {
    setPaymentStep('tiers');
    setSelectedPlan(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-indigo-950/50 text-slate-100 p-6 sm:p-8 relative"
      >
        {/* Close Button */}
        <button
          onClick={resetModal}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: PLAN TIERS */}
        {paymentStep === 'tiers' && (
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
                <Zap className="w-4 h-4 fill-amber-400" />
                Never Run Out Of AI Energy
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Get More AI Credits
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                You have <span className="text-amber-400 font-bold">{creditState.freeDaily + creditState.bonusCredits} credits</span> left today. Choose a pack to top up your balance instantly.
              </p>

              {/* Instant Free Demo Bonus Button */}
              <div className="mt-4 p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-200">Want to test right now?</p>
                    <p className="text-[11px] text-slate-400">Claim 5 free instant demo top-up credits instantly!</p>
                  </div>
                </div>
                <button
                  onClick={handleClaimFreeDemoBonus}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Claim +5 Free Demo Credits
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between relative transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-b from-indigo-950/90 via-slate-900 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.badge && (
                    <span
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md ${
                        plan.popular
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950'
                          : 'bg-slate-800 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    </div>

                    <div className="mb-3">
                      <span className="text-2xl font-black text-white">{plan.price}</span>
                      <span className="text-xs font-bold text-amber-400 block mt-0.5">
                        {plan.creditsText}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-4 min-h-[32px]">
                      {plan.description}
                    </p>

                    <div className="space-y-2 mb-6 border-t border-slate-800/80 pt-3">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={plan.id === 'free'}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      plan.id === 'free'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    {plan.id !== 'free' && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>30-Day Satisfaction Guarantee • Instant Balance Refill • Cancel Anytime</span>
            </div>
          </div>
        )}

        {/* STEP 2: CHECKOUT DIALOG */}
        {paymentStep === 'checkout' && selectedPlan && (
          <div className="max-w-xl mx-auto">
            <button
              onClick={() => setPaymentStep('tiers')}
              className="text-xs text-indigo-400 hover:underline mb-4 inline-block font-semibold"
            >
              ← Back to plans
            </button>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedPlan.name}</h3>
                  <p className="text-xs text-slate-400">{selectedPlan.creditsText}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">{selectedPlan.price}</span>
                  <span className="text-[10px] text-slate-500 block">One-time payment</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-5">
                <label className="text-xs font-bold text-slate-300 block mb-2">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Credit Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('gpay')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'gpay'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Google Pay
                  </button>
                  <button
                    onClick={() => setPaymentMethod('apple')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'apple'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Apple Pay
                  </button>
                </div>
              </div>

              {/* Card details mockup */}
              {paymentMethod === 'card' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Expiry</label>
                      <input
                        type="text"
                        defaultValue="08/28"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">CVC</label>
                      <input
                        type="text"
                        defaultValue="888"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleCompletePurchase}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Secure Checkout...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay {selectedPlan.price} & Add {selectedPlan.creditAmount} Credits</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-3">
              Encrypted 256-Bit SSL Checkout • Instant Credit Refill
            </p>
          </div>
        )}

        {/* STEP 3: SUCCESS CELEBRATION */}
        {paymentStep === 'success' && selectedPlan && (
          <div className="text-center py-8 max-w-md mx-auto">
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-emerald-400 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20 mb-5"
            >
              <PartyPopper className="w-10 h-10 text-slate-950" />
            </motion.div>

            <h3 className="text-2xl font-black text-white mb-2">Credits Added Successfully!</h3>
            <p className="text-sm text-slate-300 mb-6">
              You've unlocked <span className="text-amber-400 font-extrabold">+{selectedPlan.creditAmount} Credits</span>. Your total balance is now <span className="text-white font-extrabold">{creditState.freeDaily + creditState.bonusCredits} credits</span>.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between text-slate-400">
                <span>Transaction ID:</span>
                <span className="font-mono text-slate-200">#TX-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Pack:</span>
                <span className="font-semibold text-white">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Added Balance:</span>
                <span className="font-bold text-amber-400">+{selectedPlan.creditAmount} ⚡</span>
              </div>
            </div>

            <button
              onClick={resetModal}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              Start Creating with AI Tools
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
