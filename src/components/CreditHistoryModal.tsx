import React from 'react';
import { History, Zap, ArrowUpRight, ArrowDownLeft, Clock, ShieldCheck, Gift } from 'lucide-react';
import { CreditState, getTimeUntilReset } from '../utils/creditManager';

interface CreditHistoryModalProps {
  creditState: CreditState;
  onOpenPricing: () => void;
}

export const CreditHistoryModal: React.FC<CreditHistoryModalProps> = ({
  creditState,
  onOpenPricing,
}) => {
  const { hours, minutes } = getTimeUntilReset();
  const totalBalance = creditState.freeDaily + creditState.bonusCredits;

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Available */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Total Credit Balance</span>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
              <Zap className="w-6 h-6 fill-amber-400" />
              <span>{totalBalance}</span>
              <span className="text-xs text-slate-400 font-normal">Credits</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              5 Free Daily + {creditState.bonusCredits} Purchased
            </p>
          </div>
          <button
            onClick={onOpenPricing}
            className="p-3 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 font-bold text-xs rounded-2xl flex items-center gap-1"
          >
            <Gift className="w-4 h-4" /> Top Up
          </button>
        </div>

        {/* Daily Reset Countdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Next 5 Free Credits Reset</span>
            <div className="text-2xl font-black text-indigo-300 mt-1 font-mono flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>{hours}h {minutes}m</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Resets daily at 00:00 UTC
            </p>
          </div>
        </div>

        {/* Total Usage */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Lifetime Credits Spent</span>
            <div className="text-2xl font-black text-slate-200 mt-1">
              {creditState.totalUsed} <span className="text-xs text-slate-400 font-normal">Credits</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Tracked across tools, chat, and prompt generator</p>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Credit Transaction Ledger</h3>
              <p className="text-xs text-slate-400">Real-time history of credit grants and usage events.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
          {creditState.history && creditState.history.length > 0 ? (
            creditState.history.map((tx) => {
              const isGain = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        isGain
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isGain ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{tx.description}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{tx.timestamp}</span>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-black text-sm ${
                      isGain ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isGain ? `+${tx.amount}` : tx.amount} ⚡
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">No transaction history recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
