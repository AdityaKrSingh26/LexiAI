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
    config.headers.Authorization = token;
  }
  return config;
});

const useChatStore = create((set, get) => ({
  messages: [],
  currentPdf: null,
  pdfs: [],
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,

  fetchPDFs: async (userId) => {
    try {
      const { data } = await api.get(`/api/pdfs/${userId}/pdfs`);
      set({ pdfs: data.data });
    } catch (error) {
      console.error('Failed to fetch PDFs:', error.response?.data || error.message);
    }
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
      await api.delete(`/api/pdfs/${pdfId}`);
      set(state => ({
        pdfs: state.pdfs.filter(pdf => pdf._id !== pdfId),
        currentPdf: state.currentPdf?._id === pdfId ? null : state.currentPdf
      }));
    } catch (error) {
      console.error('Failed to delete PDF:', error.response?.data || error.message);
    }
  },

  askQuestion: async (question) => {
    const { currentPdf } = get();
    if (!currentPdf) return;

    try {
      set({ isLoading: true });
      set(state => ({
        messages: [...state.messages, { type: 'user', content: question }]
      }));

      const { data } = await api.post(`/api/pdfs/${currentPdf._id}/ask`, { question });

      set(state => ({
        messages: [...state.messages, { type: 'bot', content: data.data.response }]
      }));
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

  setCurrentPdf: (pdf) => set({ currentPdf: pdf, messages: [] }),
  clearChat: () => set({ messages: [], currentPdf: null }),
}));

export default useChatStore;