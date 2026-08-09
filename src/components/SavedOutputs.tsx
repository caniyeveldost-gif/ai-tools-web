import React, { useState, useEffect } from 'react';
import { Bookmark, Copy, Check, Trash2, Search, FileText, Wand2, MessageSquare } from 'lucide-react';
import { SavedOutputItem } from '../types';

interface SavedOutputsProps {
  onSendToChat: (content: string) => void;
}

export const SavedOutputs: React.FC<SavedOutputsProps> = ({ onSendToChat }) => {
  const [items, setItems] = useState<SavedOutputItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = () => {
    try {
      const raw = localStorage.getItem('ai_tools_hub_saved_v1');
      if (raw) {
        setItems(JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to load saved items:', e);
    }
  };

  const handleDelete = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem('ai_tools_hub_saved_v1', JSON.stringify(updated));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bookmark className="w-5 h-5 fill-amber-400/20" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Saved AI Outputs Library</h2>
            <p className="text-xs text-slate-400">Access your saved prompts, summaries, and generated copies.</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Saved Items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative group"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    {item.type === 'tool' && <FileText className="w-4 h-4 text-indigo-400" />}
                    {item.type === 'prompt' && <Wand2 className="w-4 h-4 text-purple-400" />}
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.createdAt}</span>
                </div>

                <div className="mt-3 bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 font-mono leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {item.content}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(item.id, item.content)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === item.id ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => onSendToChat(item.content)}
                    className="px-2.5 py-1 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Send to Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
          <Bookmark className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-slate-300">No saved items found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When you generate outputs using AI Tools or Prompt Generator, click "Save" to keep them here for future reference.
          </p>
        </div>
      )}
    </div>
  );
};
