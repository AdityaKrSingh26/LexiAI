import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Add 'Bearer ' prefix
  }
  return config;
});

const storedUser = localStorage.getItem('user');
const userId = storedUser ? JSON.parse(storedUser).id : null;

const useChatStore = create((set, get) => ({
  messages: [],
  currentPdf: null,
  pdfs: [],
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  chatHistory: {}, // Add this to store chat history

  fetchPDFs: async (userId) => {
    try {
      set({ isLoading: true });
      const { data } = await api.get(`/api/pdfs/${userId}/pdfs`);

      // Update both pdfs and chatHistory from the response
      const chatHistory = {};
      data.data.forEach(pdf => {
        chatHistory[pdf.title] = pdf.chats || [];
      });

      set({
        pdfs: data.data,
        chatHistory: chatHistory
      });
    } catch (error) {
      console.error('Failed to fetch PDFs:', error.response?.data || error.message);
    } finally {
      set({ isLoading: false });
    }
  },

  // Add this new method to update chat history
  updateChatHistory: (pdfName, message) => {
    set(state => ({
      chatHistory: {
        ...state.chatHistory,
        [pdfName]: [...(state.chatHistory[pdfName] || []), message]
      }
    }));
  },

  uploadPDF: async (file, userId) => {
    try {
      set({ isUploading: true });
      const formData = new FormData();
      // Change field name to 'pdf' to match server configuration
      formData.append('pdf', file);
      formData.append('userId', userId);
      formData.append('title', file.name);

      const { data } = await api.post('/api/pdfs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (event) => {
          const progress = Math.round((event.loaded * 100) / event.total);
          set({ uploadProgress: progress });
        },
      });

      if (!data.success) {
        throw new Error(data.message || 'Upload failed');
      }

      set(state => ({
        pdfs: [...state.pdfs, data.data],
        currentPdf: data.data
      }));

      return data.data;
    } catch (error) {
      console.error('Failed to upload PDF:', error.response?.data || error.message);
      throw error;
    } finally {
      set({ isUploading: false, uploadProgress: 0 });
    }
  },

  deletePDF: async (pdfId) => {
    try {
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      await api.delete(`/api/pdfs/${pdfId}`, {
        data: { userId } // Send userId in request body
      });

      set(state => ({
        pdfs: state.pdfs.filter(pdf => pdf._id !== pdfId),
        currentPdf: state.currentPdf?._id === pdfId ? null : state.currentPdf,
        chatHistory: {
          ...state.chatHistory,
          [pdfId]: undefined // Remove the chat history for the deleted PDF
        }
      }));
    } catch (error) {
      console.error('Failed to delete PDF:', error.response?.data || error.message);
      throw error;
    }
  },


  fetchPDFChats: async (pdfId) => {
    try {
      set({ isLoading: true });
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data } = await api.get(`/api/chats/${pdfId}/chats`, {
        params: { userId }
      });

      if (data.success && Array.isArray(data.data)) {
        const formattedChats = data.data.map(chat => [
          {
            type: 'user',
            content: chat.question,
            timestamp: chat.createdAt
          },
          {
            type: 'bot',
            content: chat.response,
            timestamp: chat.createdAt
          }
        ]).flat();

        set({ messages: formattedChats });
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Modify askQuestion to update chat history
  askQuestion: async (question, userId) => {
    const { currentPdf } = get();
    if (!currentPdf) return;

    try {
      set({ isLoading: true });
      const userMessage = { type: 'user', content: question };

      set(state => ({
        messages: [...state.messages, userMessage]
      }));

      const { data } = await api.post(`/api/pdfs/${currentPdf._id}/ask`, { question, userId });
      const botMessage = { type: 'bot', content: data.data.response };

      set(state => ({
        messages: [...state.messages, botMessage]
      }));

      // Update chat history
      get().updateChatHistory(currentPdf.title, userMessage);
      get().updateChatHistory(currentPdf.title, botMessage);
    } catch (error) {
      console.error('Failed to get answer:', error.response?.data || error.message);
    } finally {
      set({ isLoading: false });
    }
  },

  generateFlow: async (pdfId) => {
    try {
      set({ isLoading: true });
      const { data } = await api.get(`/api/pdfs/${pdfId}/flow`);
      return data.data.flow;
    } catch (error) {
      console.error('Failed to generate flow:', error.response?.data || error.message);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentPdf: async (pdf) => {
    const store = get();

    if (!pdf) {
      set({ currentPdf: null, messages: [] });
      return;
    }

    set({ currentPdf: pdf });
    await store.fetchPDFChats(pdf._id);
  },
  
  clearChat: () => {
    const { currentPdf } = get();
    set(state => ({
      messages: [],
      currentPdf: null,
      chatHistory: currentPdf
        ? { ...state.chatHistory, [currentPdf.title]: [] }
        : state.chatHistory
    }));
  },
}));

export default useChatStore;