import React from 'react';
import { FileText, X, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useChatStore from '../utils/chatStore';

const MultiDocSelector = () => {
  const { pdfs, selectedPdfIds, togglePdfSelection, clearPdfSelection } = useChatStore();

  if (pdfs.length === 0) {
    return (
      <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-gray-400 text-sm text-center">
        No documents available. Upload a PDF first.
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300 font-medium flex items-center gap-2">
          <CheckSquare size={14} className="text-indigo-400" />
          Select documents to query
          {selectedPdfIds.length > 0 && (
            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
              {selectedPdfIds.length} selected
            </span>
          )}
        </span>
        {selectedPdfIds.length > 0 && (
          <button
            onClick={clearPdfSelection}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {pdfs.map(pdf => {
          const selected = selectedPdfIds.includes(pdf._id);
          return (
            <button
              key={pdf._id}
              onClick={() => togglePdfSelection(pdf._id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                selected
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-indigo-500/50 hover:text-white'
              }`}
            >
              <FileText size={11} />
              <span className="max-w-32 truncate">{pdf.title}</span>
            </button>
          );
        })}
      </div>

      {selectedPdfIds.length > 5 && (
        <p className="text-xs text-yellow-400 mt-2">Maximum 5 documents per query.</p>
      )}
    </div>
  );
};

export default MultiDocSelector;
