import React, { useState } from 'react';
import {
  Wand2,
  Zap,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  MessageSquare,
  Sliders,
  Camera,
  Layers,
  AlertCircle,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import { CreditState, GeneratedPrompt, SavedOutputItem } from '../types';
import { deductCredit } from '../utils/creditManager';

interface PromptGeneratorProps {
  creditState: CreditState;
  setCreditState: (state: CreditState) => void;
  onOpenPricing: () => void;
  onSendToChat: (promptText: string) => void;
}

export const PromptGenerator: React.FC<PromptGeneratorProps> = ({
  creditState,
  setCreditState,
  onOpenPricing,
  onSendToChat,
}) => {
  const [platform, setPlatform] = useState('Midjourney v6');
  const [coreIdea, setCoreIdea] = useState('');
  const [toneStyle, setToneStyle] = useState('Cinematic Photorealistic');
  const [detailLevel, setDetailLevel] = useState('Deeply Detailed');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [cameraLighting, setCameraLighting] = useState('85mm Lens, Volumetric Lighting');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distortion, extra fingers');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedPrompt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const platforms = [
    { id: 'Midjourney v6', label: 'Midjourney v6' },
    { id: 'DALL-E 3', label: 'DALL-E 3' },
    { id: 'ChatGPT & Claude', label: 'ChatGPT / Claude' },
    { id: 'Code Spec', label: 'Code Spec' },
    { id: 'Copywriting Pitch', label: 'Copywriting Pitch' },
    { id: 'Video Generation', label: 'Sora / Veo Video' },
  ];

  const handleGeneratePrompt = async () => {
    if (!coreIdea.trim()) return;

    // Deduct credit
    const deductRes = deductCredit(
      creditState,
      1,
      `Prompt Engineering: ${platform}`,
      'prompt_usage'
    );

    if (!deductRes.success) {
      setErrorMsg('You have run out of credits! Please top up to generate prompts.');
      onOpenPricing();
      return;
    }

    setCreditState(deductRes.newState);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPlatform: platform,
          coreIdea,
          toneStyle,
          detailLevel,
          aspectRatio,
          cameraAngle: cameraLighting,
          lighting: cameraLighting,
          negativePrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt.');
      }

      const resObj = data.result;
      const promptObj: GeneratedPrompt = {
        id: 'prompt-' + Date.now(),
        targetPlatform: platform,
        coreIdea,
        masterPrompt: resObj.masterPrompt || '',
        breakdown: resObj.breakdown || [],
        negativePrompt: resObj.negativePrompt,
        recommendedSettings: resObj.recommendedSettings,
        usageTips: resObj.usageTips || [],
        variants: resObj.variants || [],
        createdAt: new Date().toLocaleTimeString(),
      };

      setGeneratedResult(promptObj);
    } catch (err: any) {
      console.error('Prompt generator error:', err);
      setErrorMsg(err.message || 'An error occurred while building prompt.');
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
    if (!generatedResult) return;

    const newItem: SavedOutputItem = {
      id: 'saved-prompt-' + Date.now(),
      title: `${generatedResult.targetPlatform} Master Prompt`,
      type: 'prompt',
      content: generatedResult.masterPrompt,
      createdAt: new Date().toLocaleDateString(),
      metadata: { platform: generatedResult.targetPlatform },
    };

    try {
      const raw = localStorage.getItem('ai_tools_hub_saved_v1') || '[]';
      const existing: SavedOutputItem[] = JSON.parse(raw);
      localStorage.setItem('ai_tools_hub_saved_v1', JSON.stringify([newItem, ...existing]));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT FORM: CONFIGURATION */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Prompt Engineering Studio</h3>
            <p className="text-xs text-slate-400">Costs 1 Credit per Master Prompt</p>
          </div>
        </div>

        {/* Target Platform Selector */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Target AI Platform
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                  platform === p.id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Core Concept / Raw Idea */}
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            Core Idea / Concept / Subject
          </label>
          <textarea
            rows={3}
            value={coreIdea}
            onChange={(e) => setCoreIdea(e.target.value)}
            placeholder="e.g. Futuristic glass skyscraper with vertical forest gardens at sunset..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Tone & Style Options */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Tone & Aesthetic</label>
            <select
              value={toneStyle}
              onChange={(e) => setToneStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="Cinematic Photorealistic">Cinematic Photorealistic</option>
              <option value="Unreal Engine 5 Render">3D Unreal Engine Render</option>
              <option value="Cyberpunk Neon Sci-Fi">Cyberpunk Neon</option>
              <option value="Minimalist Corporate">Minimalist Corporate</option>
              <option value="Master Class Technical">Technical / Analytical</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Detail Depth</label>
            <select
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="Compact & Punchy">Compact & Punchy</option>
              <option value="Standard Master">Standard Master</option>
              <option value="Deeply Detailed">Deeply Detailed</option>
            </select>
          </div>
        </div>

        {/* Camera & Aspect Ratio */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
            >
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="9:16">9:16 (Vertical)</option>
              <option value="4:3">4:3 (Classic)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Camera & Light</label>
            <input
              type="text"
              value={cameraLighting}
              onChange={(e) => setCameraLighting(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
            />
          </div>
        </div>

        {/* Negative Prompt */}
        <div>
          <label className="text-[11px] font-bold text-slate-300 block mb-1">Negative Elements (Exclusions)</label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200"
          />
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={onOpenPricing} className="px-2 py-0.5 bg-rose-500 text-white rounded text-[10px] font-bold">
              Top Up
            </button>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleGeneratePrompt}
          disabled={isLoading || !coreIdea.trim()}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            isLoading || !coreIdea.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-lg shadow-purple-600/30'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Generating Master Prompt...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              <span>Generate Master Prompt (1 Credit)</span>
            </>
          )}
        </button>
      </div>

      {/* RIGHT OUTPUT DISPLAY */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        {generatedResult ? (
          <div className="space-y-4">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Master Prompt Ready ({generatedResult.targetPlatform})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedResult.masterPrompt)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-indigo-600/20"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </button>
                <button
                  onClick={handleSaveToLibrary}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  {savedSuccess ? 'Saved!' : 'Save'}
                </button>
                <button
                  onClick={() => onSendToChat(generatedResult.masterPrompt)}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-purple-300 flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Test in Chat
                </button>
              </div>
            </div>

            {/* Master Prompt Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white font-mono leading-relaxed relative group">
              <div className="select-all">{generatedResult.masterPrompt}</div>
            </div>

            {/* Breakdown Cards */}
            {generatedResult.breakdown.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Prompt Component Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {generatedResult.breakdown.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                        {item.part}
                      </span>
                      <p className="text-[11px] text-slate-300 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Settings & Tips */}
            {generatedResult.usageTips && generatedResult.usageTips.length > 0 && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
                <h4 className="text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Pro Usage Tips
                </h4>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  {generatedResult.usageTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Variant Prompts */}
            {generatedResult.variants && generatedResult.variants.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">Alternative Variants</h4>
                <div className="space-y-2">
                  {generatedResult.variants.map((v, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                      <span className="truncate max-w-[85%]">{v}</span>
                      <button
                        onClick={() => handleCopy(v)}
                        className="text-xs text-indigo-400 hover:underline flex-shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-500 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-500">
              <Wand2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-300">Prompt Engineering Output</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Configure your target platform and core concept on the left, then click Generate to create an optimized master prompt.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
