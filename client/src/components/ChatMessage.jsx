import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message, type, onDelete }) => {
  const isUser = type === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
  };

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