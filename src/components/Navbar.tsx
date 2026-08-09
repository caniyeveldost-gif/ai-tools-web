import React from 'react';
import { Sparkles, Bot, Wand2, Bookmark, History, Zap, PlusCircle } from 'lucide-react';
import { CreditState, getTimeUntilReset } from '../utils/creditManager';

interface NavbarProps {
  activeTab: 'tools' | 'chat' | 'prompt' | 'saved' | 'history';
  setActiveTab: (tab: 'tools' | 'chat' | 'prompt' | 'saved' | 'history') => void;
  creditState: CreditState;
  onOpenPricing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  creditState,
  onOpenPricing,
}) => {
  const totalCredits = creditState.freeDaily + creditState.bonusCredits;
  const { hours, minutes } = getTimeUntilReset();

  const navItems = [
    { id: 'tools', label: 'AI Tools Hub', icon: Sparkles },
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'prompt', label: 'Prompt Generator', icon: Wand2 },
    { id: 'saved', label: 'Saved Outputs', icon: Bookmark },
    { id: 'history', label: 'Credits Log', icon: History },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('tools')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  AI Tools Hub
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-4 rate-limit hidden sm:block text-slate-400">
                5 Daily Free Credits Engine
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Credit Balance & Buy Credits CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Credit Badge */}
            <div
              onClick={() => setActiveTab('history')}
              className="flex items-center gap-2 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200 group"
              title={`Free Daily: ${creditState.freeDaily}/5 (Resets in ${hours}h ${minutes}m) | Bonus: ${creditState.bonusCredits}`}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-3.5 h-3.5 fill-amber-400/30" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-white tracking-wide">
                    {totalCredits}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">Credits</span>
                </div>
                <div className="text-[10px] text-amber-400/90 font-medium leading-none">
                  {creditState.freeDaily}/5 Free Daily
                </div>
              </div>
            </div>

            {/* Buy Credits Button */}
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Get Credits</span>
              <span className="sm:hidden">+ Buy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Nav */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 border-t border-slate-800 px-2 py-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
