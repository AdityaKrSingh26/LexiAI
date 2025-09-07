import React, { useState } from 'react';
import { Search, RefreshCw, BarChart3, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// Create API instance similar to chatStore
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

const SemanticSearchInfo = ({ currentPdf }) => {
  const [isRechunking, setIsRechunking] = useState(false);
  const [chunkStats, setChunkStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const handleRechunkPDFs = async () => {
    try {
      setIsRechunking(true);
      
      const response = await api.post('/api/pdfs/rechunk');
      
      if (response.data.success) {
        toast.success(`✅ Re-chunking completed! Processed: ${response.data.processed}, Errors: ${response.data.errors}`);
      } else {
        toast.error(`❌ Re-chunking failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error re-chunking PDFs:', error);
      if (error.response) {
        toast.error(`❌ Error: ${error.response.data?.message || 'Server error'}`);
      } else {
        toast.error('❌ Error during re-chunking process');
      }
    } finally {
      setIsRechunking(false);
    }
  };

  const fetchChunkStats = async () => {
    if (!currentPdf) return;
    
    try {
      const response = await api.get(`/api/pdfs/${currentPdf._id}/chunks`);
      
      if (response.data.success) {
        setChunkStats(response.data.data);
        setShowStats(true);
      } else {
        toast.error('Failed to fetch chunking statistics');
      }
    } catch (error) {
      console.error('Error fetching chunk stats:', error);
      if (error.response) {
        toast.error(`❌ Error: ${error.response.data?.message || 'Server error'}`);
      } else {
        toast.error('Error fetching statistics');
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Search className="text-blue-400" size={20} />
        <h3 className="text-lg font-semibold text-white">Semantic Search</h3>
      </div>
      
      <div className="text-sm text-gray-300 mb-4 space-y-2">
        <p>
          🧠 <strong>Smart Context:</strong> Only relevant sections of your PDF are sent to AI, reducing context length and improving response quality.
        </p>
        <p>
          ⚡ <strong>Faster Processing:</strong> Semantic search finds the most relevant chunks instead of processing the entire document.
        </p>
        <p>
          📊 <strong>Better Accuracy:</strong> AI gets focused, relevant information leading to more precise answers.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleRechunkPDFs}
          disabled={isRechunking}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={isRechunking ? 'animate-spin' : ''} size={16} />
          {isRechunking ? 'Re-chunking...' : 'Re-chunk All PDFs'}
        </button>

        {currentPdf && (
          <button
            onClick={fetchChunkStats}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            <BarChart3 size={16} />
            View Chunk Stats
          </button>
        )}
      </div>

      {showStats && chunkStats && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-600">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-green-400" size={16} />
            <h4 className="font-semibold text-white">Chunking Statistics</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{chunkStats.totalChunks}</div>
              <div className="text-gray-400">Total Chunks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{Math.round(chunkStats.averageChunkSize)}</div>
              <div className="text-gray-400">Avg Size (chars)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{chunkStats.totalTextLength.toLocaleString()}</div>
              <div className="text-gray-400">Total Characters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {chunkStats.chunkingEnabled ? '✅' : '❌'}
              </div>
              <div className="text-gray-400">Chunking Enabled</div>
            </div>
          </div>

          {chunkStats.chunkSizeDistribution && (
            <div className="mt-4">
              <div className="text-white font-medium mb-2">Chunk Size Distribution:</div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-400">Small (&lt;1K): {chunkStats.chunkSizeDistribution.small}</span>
                <span className="text-yellow-400">Medium (1-2K): {chunkStats.chunkSizeDistribution.medium}</span>
                <span className="text-red-400">Large (&gt;2K): {chunkStats.chunkSizeDistribution.large}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowStats(false)}
            className="mt-3 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
          >
            Close
          </button>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        💡 <strong>Tip:</strong> New documents are automatically chunked. Use "Re-chunk All PDFs" to enable semantic search for existing documents.
      </div>
    </div>
  );
};

export default SemanticSearchInfo;
