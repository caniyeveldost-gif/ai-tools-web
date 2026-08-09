import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DailyResetBanner } from './components/DailyResetBanner';
import { AiToolsDirectory } from './components/AiToolsDirectory';
import { AiChat } from './components/AiChat';
import { PromptGenerator } from './components/PromptGenerator';
import { SavedOutputs } from './components/SavedOutputs';
import { CreditHistoryModal } from './components/CreditHistoryModal';
import { PricingModal } from './components/PricingModal';
import { loadCreditState, CreditState } from './utils/creditManager';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tools' | 'chat' | 'prompt' | 'saved' | 'history'>('tools');
  const [creditState, setCreditState] = useState<CreditState>(loadCreditState);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [chatInitialMsg, setChatInitialMsg] = useState<string>('');

  useEffect(() => {
    // Periodically re-sync credit state (e.g. if midnight strikes while user is viewing)
    const interval = setInterval(() => {
      setCreditState(loadCreditState());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSendToChat = (text: string) => {
    setChatInitialMsg(text);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          creditState={creditState}
          onOpenPricing={() => setIsPricingOpen(true)}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Daily 5-Free-Credit Banner */}
          <DailyResetBanner
            creditState={creditState}
            onOpenPricing={() => setIsPricingOpen(true)}
          />

          {/* Active Tab Views */}
          {activeTab === 'tools' && (
            <AiToolsDirectory
              creditState={creditState}
              setCreditState={setCreditState}
              onOpenPricing={() => setIsPricingOpen(true)}
              onSendToChat={handleSendToChat}
            />
          )}

          {activeTab === 'chat' && (
            <AiChat
              creditState={creditState}
              setCreditState={setCreditState}
              onOpenPricing={() => setIsPricingOpen(true)}
              initialMessage={chatInitialMsg}
            />
          )}

          {activeTab === 'prompt' && (
            <PromptGenerator
              creditState={creditState}
              setCreditState={setCreditState}
              onOpenPricing={() => setIsPricingOpen(true)}
              onSendToChat={handleSendToChat}
            />
          )}

          {activeTab === 'saved' && (
            <SavedOutputs onSendToChat={handleSendToChat} />
          )}

          {activeTab === 'history' && (
            <CreditHistoryModal
              creditState={creditState}
              onOpenPricing={() => setIsPricingOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">AI Tools Hub</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
              5 Daily Free Credits Model
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Daily 5 Free Credits Auto-Reset Engine
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              Powered by Google Gemini AI
            </span>
          </div>

          <p>© 2026 AI Tools Hub. All rights reserved.</p>
        </div>
      </footer>

      {/* Pricing & Credit Top-Up Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        creditState={creditState}
        setCreditState={setCreditState}
      />
    </div>
  );
}
