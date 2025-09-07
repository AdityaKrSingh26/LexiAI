import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

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
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 Token being sent:', token.substring(0, 20) + '...');
  } else {
    console.warn('⚠️ No token found in localStorage');
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚫 Authentication failed - redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
      const { data } = await api.get(`/api/pdfs/user/${userId}/pdfs`);

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
      // Check file size before upload (10MB limit)
      const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxFileSize) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        toast.error(`File too large! Size: ${fileSizeMB}MB. Maximum allowed: 10MB`, {
          duration: 6000,
          icon: '⚠️',
        });
        throw new Error('File too large');
      }

      set({ isUploading: true });
      
      // Show uploading toast
      const uploadingToast = toast.loading('Uploading PDF...', {
        icon: '📄',
      });

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

      // Dismiss loading toast and show success
      toast.dismiss(uploadingToast);
      toast.success(`PDF "${file.name}" uploaded successfully!`, {
        duration: 3000,
        icon: '✅',
      });

      set(state => ({
        pdfs: [...state.pdfs, data.data],
        currentPdf: data.data,
        messages: [] // Clear messages when uploading a new document
      }));

      return data.data;
    } catch (error) {
      console.error('Failed to upload PDF:', error.response?.data || error.message);
      
      // Handle different types of errors
      if (error.response?.status === 413 || error.response?.data?.error?.includes('too large')) {
        toast.error('File too large! Maximum size allowed is 10MB', {
          duration: 6000,
          icon: '⚠️',
        });
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Upload failed';
        toast.error(errorMessage, {
          duration: 5000,
          icon: '❌',
        });
      } else if (error.message === 'File too large') {
        // Already handled above, don't show another toast
      } else {
        toast.error('Failed to upload PDF. Please try again.', {
          duration: 5000,
          icon: '❌',
        });
      }
      
      throw error;
    } finally {
      set({ isUploading: false, uploadProgress: 0 });
    }
  },

  deletePDF: async (pdfId) => {
    try {
      await api.delete(`/api/pdfs/${pdfId}`);

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
      const botMessage = { 
        type: 'bot', 
        content: data.data.response,
        metadata: data.data.metadata,
        searchMetadata: data.data.searchMetadata
      };

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

  updateNotes: async (pdfId, notes) => {
    try {
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      if (!userId || !pdfId) return;

      const { data } = await api.put(`/api/pdfs/${pdfId}/notes`, {
        notes,
        userId
      });

      if (data.success) {
        set(state => ({
          pdfs: state.pdfs.map(pdf =>
            pdf._id === pdfId ? { ...pdf, notes: data.data.notes } : pdf
          )
        }));
      }
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  },

  getNotes: async (pdfId) => {
    try {
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      if (!userId || !pdfId) return null;

      const { data } = await api.get(`/api/pdfs/${pdfId}/notes`, {
        params: { userId } // Changed from data to params
      });

      return data.success ? data.data.notes : null;
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      return null;
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

  setCurrentPdf: async (pdf, options = {}) => {
    const store = get();
    const { clearMessages = false } = options;

    if (!pdf) {
      set({ currentPdf: null, messages: [] });
      return;
    }

    set({ currentPdf: pdf });
    
    if (clearMessages) {
      set({ messages: [] });
    } else {
      await store.fetchPDFChats(pdf._id);
    }
  },
  
  clearChat: () => {
    set({ messages: [] });
  },

  // Start a new chat with the current PDF (clears messages but keeps the PDF)
  startNewChatWithCurrentPdf: () => {
    const { currentPdf } = get();
    if (currentPdf) {
      set({ messages: [] });
    }
  },
}));

export default useChatStore;