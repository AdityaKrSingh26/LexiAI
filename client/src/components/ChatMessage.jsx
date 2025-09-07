import React, { useState } from 'react';
import { Copy, Trash2, Search, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message, type, onDelete, metadata, searchMetadata }) => {
  const isUser = type === 'user';
  const [showMetadata, setShowMetadata] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
  };

  const hasSearchInfo = searchMetadata || (metadata && (metadata.searchMethod || metadata.chunksUsed));

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`group relative max-w-[80%] p-4 rounded-lg ${isUser ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-800 text-white'
          }`}
      >
        <div className="text-sm prose prose-invert max-w-none">
          <ReactMarkdown>
            {message}
          </ReactMarkdown>
        </div>

        {/* Search metadata display for AI responses */}
        {!isUser && hasSearchInfo && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Search size={12} />
              <span>Search Details</span>
              {showMetadata ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            
            {showMetadata && (
              <div className="mt-2 p-3 bg-gray-700 rounded text-xs text-gray-300 space-y-1">
                {(searchMetadata?.searchMethod || metadata?.searchMethod) && (
                  <div className="flex justify-between">
                    <span>Search Method:</span>
                    <span className="font-mono">
                      {searchMetadata?.searchMethod || metadata?.searchMethod}
                    </span>
                  </div>
                )}
                {(searchMetadata?.selectedChunks || metadata?.chunksUsed) && (
                  <div className="flex justify-between">
                    <span>Chunks Used:</span>
                    <span className="font-mono">
                      {searchMetadata?.selectedChunks || metadata?.chunksUsed}
                      {(searchMetadata?.totalChunks || metadata?.totalChunks) && 
                        ` / ${searchMetadata?.totalChunks || metadata?.totalChunks}`
                      }
                    </span>
                  </div>
                )}
                {(searchMetadata?.contextLength || metadata?.contextLength) && (
                  <div className="flex justify-between">
                    <span>Context Length:</span>
                    <span className="font-mono">
                      {(searchMetadata?.contextLength || metadata?.contextLength).toLocaleString()} chars
                    </span>
                  </div>
                )}
                {(searchMetadata?.averageRelevanceScore || metadata?.averageRelevanceScore) && (
                  <div className="flex justify-between">
                    <span>Relevance Score:</span>
                    <span className="font-mono">
                      {((searchMetadata?.averageRelevanceScore || metadata?.averageRelevanceScore) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-600">
                  💡 This response was generated using semantic search to find the most relevant content.
                </div>
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-1 right-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={copyToClipboard}
            className="p-1 bg-gray-700 rounded text-gray-300 hover:text-white"
            title="Copy message"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;