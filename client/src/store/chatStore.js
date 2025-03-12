import { create } from 'zustand';

const useChatStore = create((set) => ({
  messages: [],
  currentPdf: null,
  chatHistory: {},
  isLoading: false,
  
  addMessage: (message) => 
    set((state) => ({ 
      messages: [...state.messages, message],
      chatHistory: {
        ...state.chatHistory,
        [state.currentPdf?.name]: [...(state.chatHistory[state.currentPdf?.name] || []), message]
      }
    })),
    
  setPdf: (pdf) => 
    set({ currentPdf: pdf, messages: [] }),
    
  setLoading: (status) => 
    set({ isLoading: status }),
    
  clearChat: () => 
    set({ messages: [], currentPdf: null }),
}));

export default useChatStore;