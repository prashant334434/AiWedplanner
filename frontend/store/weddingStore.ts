import { create } from 'zustand';

interface WeddingSetup {
  wedding_type?: string;
  guest_count?: number;
  budget?: number;
  wedding_date?: string;
  location?: string;
}

interface WeddingState {
  setup: WeddingSetup;
  updateSetup: (data: Partial<WeddingSetup>) => void;
  resetSetup: () => void;
}

export const useWeddingStore = create<WeddingState>((set) => ({
  setup: {},
  
  updateSetup: (data: Partial<WeddingSetup>) => 
    set((state) => ({ setup: { ...state.setup, ...data } })),
  
  resetSetup: () => set({ setup: {} }),
}));