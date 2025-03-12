import React from 'react';
import { Copy, Trash2 } from 'lucide-react';

const ChatMessage = ({ message, type, onDelete }) => {
  const isUser = type === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`relative max-w-[80%] p-4 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white ml-auto'
            : 'bg-gray-800 text-white'
        }`}
      >
        <p className="text-sm">{message}</p>
        
        <div className="absolute bottom-1 right-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;