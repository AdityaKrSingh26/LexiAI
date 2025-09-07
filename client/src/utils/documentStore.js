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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const useDocumentStore = create((set, get) => ({
  documents: [],
  collections: [],
  analytics: null,
  isLoading: false,
  loadingStates: {
    documents: false,
    collections: false,
    analytics: false,
  },
  searchResults: [],
  selectedCollection: null,

  // Helper to update loading states
  setLoadingState: (key, value) => {
    set(state => {
      const newLoadingStates = { ...state.loadingStates, [key]: value };
      const isLoading = Object.values(newLoadingStates).some(loading => loading);
      return {
        loadingStates: newLoadingStates,
        isLoading
      };
    });
  },

  // Document operations
  fetchDocuments: async () => {
    try {
      get().setLoadingState('documents', true);
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;
      
      if (!userId) return;

      const { data } = await api.get(`/api/pdfs/user/${userId}/pdfs`);
      set({ documents: data.data || [] });
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      get().setLoadingState('documents', false);
    }
  },

  searchDocuments: async (query, filters = {}) => {
    try {
      set({ isLoading: true });
      const params = new URLSearchParams({ query, ...filters });
      const { data } = await api.get(`/api/pdfs/search?${params}`);
      set({ documents: data.data || [], searchResults: data.data || [] });
    } catch (error) {
      console.error('Failed to search documents:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDocument: async (documentId) => {
    try {
      await api.delete(`/api/pdfs/${documentId}`);
      
      set(state => ({
        documents: state.documents.filter(doc => doc._id !== documentId)
      }));
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  },

  toggleFavorite: async (documentId) => {
    try {
      const { data } = await api.post(`/api/pdfs/${documentId}/favorite`);
      
      set(state => ({
        documents: state.documents.map(doc =>
          doc._id === documentId ? { ...doc, isFavorite: data.data.isFavorite } : doc
        )
      }));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  },

  shareDocument: async (documentId, email, permission = 'read') => {
    try {
      const { data } = await api.post(`/api/pdfs/${documentId}/share`, {
        email,
        permission
      });
      return data;
    } catch (error) {
      console.error('Failed to share document:', error);
      throw error;
    }
  },

  bulkOperations: async (operation, documentIds, data = {}) => {
    try {
      const { data: result } = await api.post('/api/pdfs/bulk', {
        operation,
        documentIds,
        data
      });
      
      // Refresh documents after bulk operation
      get().fetchDocuments();
      return result;
    } catch (error) {
      console.error('Failed to perform bulk operation:', error);
      throw error;
    }
  },

  // Collection operations
  fetchCollections: async () => {
    try {
      get().setLoadingState('collections', true);
      const { data } = await api.get('/api/collections');
      set({ collections: data.data || [] });
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      get().setLoadingState('collections', false);
    }
  },

  createCollection: async (collectionData) => {
    try {
      const { data } = await api.post('/api/collections', collectionData);
      
      set(state => ({
        collections: [...state.collections, data.data]
      }));
      
      return data.data;
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  },

  updateCollection: async (collectionId, updates) => {
    try {
      const { data } = await api.put(`/api/collections/${collectionId}`, updates);
      
      set(state => ({
        collections: state.collections.map(col =>
          col._id === collectionId ? data.data : col
        )
      }));
      
      return data.data;
    } catch (error) {
      console.error('Failed to update collection:', error);
      throw error;
    }
  },

  deleteCollection: async (collectionId) => {
    try {
      await api.delete(`/api/collections/${collectionId}`);
      
      set(state => ({
        collections: state.collections.filter(col => col._id !== collectionId)
      }));
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  },

  getCollectionById: async (collectionId) => {
    try {
      const { data } = await api.get(`/api/collections/${collectionId}`);
      set({ selectedCollection: data.data });
      return data.data;
    } catch (error) {
      console.error('Failed to fetch collection:', error);
      throw error;
    }
  },

  addDocumentsToCollection: async (collectionId, documentIds) => {
    try {
      const { data } = await api.post(`/api/collections/${collectionId}/documents`, {
        documentIds
      });
      
      // Update the collection in state
      set(state => ({
        collections: state.collections.map(col =>
          col._id === collectionId ? data.data : col
        )
      }));
      
      return data.data;
    } catch (error) {
      console.error('Failed to add documents to collection:', error);
      throw error;
    }
  },

  removeDocumentsFromCollection: async (collectionId, documentIds) => {
    try {
      const { data } = await api.delete(`/api/collections/${collectionId}/documents`, {
        data: { documentIds }
      });
      
      // Update the collection in state
      set(state => ({
        collections: state.collections.map(col =>
          col._id === collectionId ? data.data : col
        )
      }));
      
      return data.data;
    } catch (error) {
      console.error('Failed to remove documents from collection:', error);
      throw error;
    }
  },

  shareCollection: async (collectionId, email, permission = 'read') => {
    try {
      const { data } = await api.post(`/api/collections/${collectionId}/share`, {
        email,
        permission
      });
      return data;
    } catch (error) {
      console.error('Failed to share collection:', error);
      throw error;
    }
  },

  // Analytics
  fetchAnalytics: async () => {
    try {
      get().setLoadingState('analytics', true);
      const { data } = await api.get('/api/pdfs/analytics');
      set({ analytics: data.data });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      get().setLoadingState('analytics', false);
    }
  },

  // Document versions
  getDocumentVersions: async (documentId) => {
    try {
      const { data } = await api.get(`/api/pdfs/${documentId}/versions`);
      return data.data;
    } catch (error) {
      console.error('Failed to fetch document versions:', error);
      throw error;
    }
  },

  // Tags operations
  getPopularTags: () => {
    const { documents } = get();
    const tagCounts = {};
    
    documents.forEach(doc => {
      doc.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  },

  // Filter helpers
  filterDocuments: (filters) => {
    const { documents } = get();
    
    return documents.filter(doc => {
      if (filters.favorites && !doc.isFavorite) return false;
      if (filters.tags && filters.tags.length > 0) {
        if (!doc.tags.some(tag => filters.tags.includes(tag))) return false;
      }
      if (filters.collections && filters.collections.length > 0) {
        if (!doc.collections.some(col => filters.collections.includes(col))) return false;
      }
      if (filters.dateFrom && new Date(doc.uploadedAt) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(doc.uploadedAt) > new Date(filters.dateTo)) return false;
      
      return true;
    });
  },

  // Clear state
  clearState: () => {
    set({
      documents: [],
      collections: [],
      analytics: null,
      searchResults: [],
      selectedCollection: null
    });
  },

  // Update file sizes for existing documents
  updateFileSizes: async () => {
    try {
      const { data } = await api.post('/api/pdfs/update-file-sizes');
      return data;
    } catch (error) {
      console.error('Error updating file sizes:', error);
      throw error;
    }
  }
}));

export default useDocumentStore;
