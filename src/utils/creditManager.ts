import { CreditState, CreditTransaction } from '../types';

export type { CreditState, CreditTransaction };

const STORAGE_KEY = 'ai_tools_hub_credits_v1';
const MAX_DAILY_FREE = 5;

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function loadCreditState(): CreditState {
  const today = getTodayDateString();
  const defaultState: CreditState = {
    freeDaily: MAX_DAILY_FREE,
    bonusCredits: 0,
    lastResetDate: today,
    totalUsed: 0,
    history: [
      {
        id: 'init-reset-' + Date.now(),
        type: 'daily_reset',
        amount: 5,
        description: 'Initial Daily Free Credits granted (+5 ⚡)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveCreditState(defaultState);
      return defaultState;
    }

    const state: CreditState = JSON.parse(raw);

    // Check if a new day has arrived
    if (state.lastResetDate !== today) {
      const resetTx: CreditTransaction = {
        id: 'daily-reset-' + Date.now(),
        type: 'daily_reset',
        amount: MAX_DAILY_FREE,
        description: `Daily Free Credits auto-reset (+5 ⚡) for ${today}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedState: CreditState = {
        ...state,
        freeDaily: MAX_DAILY_FREE,
        lastResetDate: today,
        history: [resetTx, ...state.history].slice(0, 50),
      };
      saveCreditState(updatedState);
      return updatedState;
    }

    return state;
  } catch (err) {
    console.error('Error loading credit state from localStorage:', err);
    return defaultState;
  }
}

export function saveCreditState(state: CreditState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving credit state:', err);
  }
}

export function deductCredit(
  currentState: CreditState,
  amount: number,
  description: string,
  type: 'tool_usage' | 'chat_usage' | 'prompt_usage'
): { success: boolean; newState: CreditState; errorReason?: string } {
  const totalAvailable = currentState.freeDaily + currentState.bonusCredits;

  if (totalAvailable < amount) {
    return {
      success: false,
      newState: currentState,
      errorReason: 'Insufficient credits! You have 0 credits remaining today.',
    };
  }

  let newFree = currentState.freeDaily;
  let newBonus = currentState.bonusCredits;
  let remainingDeduct = amount;

  if (newFree >= remainingDeduct) {
    newFree -= remainingDeduct;
    remainingDeduct = 0;
  } else {
    remainingDeduct -= newFree;
    newFree = 0;
    newBonus -= remainingDeduct;
  }

  const newTx: CreditTransaction = {
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    type,
    amount: -amount,
    description,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const newState: CreditState = {
    ...currentState,
    freeDaily: newFree,
    bonusCredits: newBonus,
    totalUsed: currentState.totalUsed + amount,
    history: [newTx, ...currentState.history].slice(0, 50),
  };

  saveCreditState(newState);
  return { success: true, newState };
}

export function addCredits(
  currentState: CreditState,
  amount: number,
  description: string,
  type: 'purchase' | 'bonus'
): CreditState {
  const newTx: CreditTransaction = {
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    type,
    amount,
    description,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const newState: CreditState = {
    ...currentState,
    bonusCredits: currentState.bonusCredits + amount,
    history: [newTx, ...currentState.history].slice(0, 50),
  };

  saveCreditState(newState);
  return newState;
}

export function getTimeUntilReset(): { hours: number; minutes: number } {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const diffMs = midnight.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}
