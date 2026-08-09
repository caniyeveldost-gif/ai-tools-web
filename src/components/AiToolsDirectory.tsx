import React, { useState } from 'react';
import {
  FileText,
  Code,
  Sparkles,
  Mail,
  Share2,
  Search,
  Palette,
  Zap,
  Filter,
  ArrowRight,
  Copy,
  Check,
  Bookmark,
  MessageSquare,
  RotateCcw,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { AI_TOOLS_DATA } from '../data/toolsData';
import { ToolCategory, ToolDefinition, CreditState, SavedOutputItem } from '../types';
import { deductCredit } from '../utils/creditManager';

interface AiToolsDirectoryProps {
  creditState: CreditState;
  setCreditState: (state: CreditState) => void;
  onOpenPricing: () => void;
  onSendToChat: (text: string) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Code,
  Sparkles,
  Mail,
  Share2,
  Search,
  Palette,
};

export const AiToolsDirectory: React.FC<AiToolsDirectoryProps> = ({
  creditState,
  setCreditState,
  onOpenPricing,
  onSendToChat,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);

  // Modal execution state
  const [inputText, setInputText] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toolOutput, setToolOutput] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const categories: { id: ToolCategory; label: string }[] = [
    { id: 'all', label: 'All AI Tools' },
    { id: 'writing', label: 'Writing & Summaries' },
    { id: 'coding', label: 'Code & Security' },
    { id: 'business', label: 'Business & Naming' },
    { id: 'marketing', label: 'Marketing & Emails' },
    { id: 'design', label: 'Design & Visuals' },
  ];

  const filteredTools = AI_TOOLS_DATA.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenToolModal = (tool: ToolDefinition) => {
    setActiveTool(tool);
    setInputText('');
    setSelectedOption(tool.defaultOption || tool.options?.[0] || '');
    setToolOutput(null);
    setErrorMsg(null);
    setCopied(false);
    setSavedSuccess(false);
  };

  const handleRunTool = async () => {
    if (!activeTool || !inputText.trim()) return;

    // Check credit deduction
    const deductRes = deductCredit(
      creditState,
      activeTool.cost,
      `Executed Tool: ${activeTool.name}`,
      'tool_usage'
    );

    if (!deductRes.success) {
      setErrorMsg('You have run out of credits! Please top up to continue using AI tools.');
      onOpenPricing();
      return;
    }

    setCreditState(deductRes.newState);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/tool/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: activeTool.id,
          input: inputText,
          options: { optionChosen: selectedOption },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute tool.');
      }

      setToolOutput(data.result);
    } catch (err: any) {
      console.error('Tool execution error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = () => {
    if (!toolOutput || !activeTool) return;

    const newItem: SavedOutputItem = {
      id: 'saved-' + Date.now(),
      title: `${activeTool.name} Output`,
      type: 'tool',
      content: toolOutput,
      createdAt: new Date().toLocaleDateString(),
      metadata: { toolId: activeTool.id, prompt: inputText },
    };

    try {
      const raw = localStorage.getItem('ai_tools_hub_saved_v1') || '[]';
      const existing: SavedOutputItem[] = JSON.parse(raw);
      localStorage.setItem('ai_tools_hub_saved_v1', JSON.stringify([newItem, ...existing]));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Save to library error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search AI Tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => {
          const IconComponent = iconMap[tool.iconName] || Sparkles;
          return (
            <div
              key={tool.id}
              onClick={() => handleOpenToolModal(tool)}
              className="group bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/40 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Badge */}
              {tool.badge && (
                <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {tool.badge}
                </span>
              )}

              <div>
                <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-indigo-500/50 flex items-center justify-center text-indigo-400 mb-4 transition-colors">
                  <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                  {tool.name}
                </h3>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 font-semibold text-amber-400">
                  <Zap className="w-3.5 h-3.5 fill-amber-400/20" /> {tool.cost} Credit
                </span>
                <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Launch Tool <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* TOOL EXECUTION MODAL */}
      {activeTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 relative text-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  {React.createElement(iconMap[activeTool.iconName] || Sparkles, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{activeTool.name}</h3>
                  <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-amber-400" /> Cost: 1 Credit
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTool(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4">
              {/* Option dropdown if tool has choices */}
              {activeTool.options && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    {activeTool.optionsLabel || 'Select Style / Format'}
                  </label>
                  <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {activeTool.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Text Input Area */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Input Details / Raw Text
                </label>
                <textarea
                  rows={5}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={activeTool.placeholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
                />
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  <button
                    onClick={onOpenPricing}
                    className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold rounded-lg"
                  >
                    Get Credits
                  </button>
                </div>
              )}

              {/* Run Tool Button */}
              <button
                onClick={handleRunTool}
                disabled={isLoading || !inputText.trim()}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isLoading || !inputText.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing with Gemini AI Engine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Result (Deduct 1 Credit)</span>
                  </>
                )}
              </button>

              {/* Output Display */}
              {toolOutput && (
                <div className="mt-6 border-t border-slate-800 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Output Ready
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(toolOutput)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={handleSaveToLibrary}
                        className="px-2.5 py-1 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-lg text-xs font-semibold text-indigo-300 flex items-center gap-1"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        {savedSuccess ? 'Saved!' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          onSendToChat(`Here is an output from ${activeTool.name}:\n\n${toolOutput}\n\nCan you expand on this?`);
                          setActiveTool(null);
                        }}
                        className="px-2.5 py-1 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 rounded-lg text-xs font-semibold text-purple-300 flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {toolOutput}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
