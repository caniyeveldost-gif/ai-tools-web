import React from 'react';
import { Zap, Clock, Info, ShieldCheck, Gift } from 'lucide-react';
import { CreditState, getTimeUntilReset } from '../utils/creditManager';

interface DailyResetBannerProps {
  creditState: CreditState;
  onOpenPricing: () => void;
}

export const DailyResetBanner: React.FC<DailyResetBannerProps> = ({
  creditState,
  onOpenPricing,
}) => {
  const { hours, minutes } = getTimeUntilReset();
  const totalCredits = creditState.freeDaily + creditState.bonusCredits;

  return (
    <div className="mb-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg shadow-black/20">
      {/* Subtle background glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
            <Zap className="w-6 h-6 fill-amber-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Daily Free Credit System
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> 5 Free Daily
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              You receive <span className="text-amber-400 font-semibold">5 free credits every 24 hours</span>. Each AI tool execution, chat turn, or prompt generation costs 1 credit.
            </p>
          </div>
        </div>

        {/* Right Info Card */}
        <div className="flex items-center gap-3 sm:gap-4 bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex-shrink-0 self-start md:self-auto">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Next Free Reset
            </span>
            <span className="text-sm font-bold text-indigo-300 font-mono">
              In {hours}h {minutes}m
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Available</span>
            <span className="text-sm font-extrabold text-amber-400">
              {totalCredits} Credits
            </span>
          </div>

          <button
            onClick={onOpenPricing}
            className="ml-2 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <Gift className="w-3.5 h-3.5" /> Top Up
          </button>
        </div>
      </div>

      {/* Credit Bar Meter */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 w-full sm:w-2/3">
          <span className="text-slate-300 font-medium flex-shrink-0">Daily 5/5 Meter:</span>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${(creditState.freeDaily / 5) * 100}%` }}
            />
          </div>
          <span className="font-semibold text-amber-400 flex-shrink-0">
            {creditState.freeDaily}/5
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Bonus balance: <span className="text-slate-200 font-semibold">{creditState.bonusCredits} credits</span>
        </div>
      </div>
    </div>
  );
};
