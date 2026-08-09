export interface CreditTransaction {
  id: string;
  type: 'daily_reset' | 'tool_usage' | 'chat_usage' | 'prompt_usage' | 'purchase' | 'bonus';
  amount: number; // positive for top-up, negative for usage
  description: string;
  timestamp: string;
}

export interface CreditState {
  freeDaily: number; // Max 5 per day
  bonusCredits: number; // Purchased or bonus credits that don't expire daily
  lastResetDate: string; // YYYY-MM-DD
  totalUsed: number;
  history: CreditTransaction[];
}

export type ToolCategory = 'all' | 'writing' | 'coding' | 'business' | 'design' | 'marketing';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  cost: number;
  badge?: string;
  placeholder: string;
  optionsLabel?: string;
  defaultOption?: string;
  options?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  persona?: string;
}

export interface PromptBreakdownItem {
  part: string;
  description: string;
}

export interface GeneratedPrompt {
  id: string;
  targetPlatform: string;
  coreIdea: string;
  masterPrompt: string;
  breakdown: PromptBreakdownItem[];
  negativePrompt?: string;
  recommendedSettings?: string;
  usageTips?: string[];
  variants?: string[];
  createdAt: string;
}

export interface SavedOutputItem {
  id: string;
  title: string;
  type: 'tool' | 'prompt' | 'chat';
  content: string;
  createdAt: string;
  metadata?: Record<string, any>;
}
