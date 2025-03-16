import React from 'react';
import { Menu, X, MessageSquare, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import useChatStore from '../utils/chatStore';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { chatHistory } = useChatStore();

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50  p-2 bg-gray-800 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed border-r-2 border-gray-700 top-0 left-0 h-full w-72 bg-gray-900 text-white p-6 shadow-2xl z-40`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="w-[100%] text-2xl font-bold text-right">History</h2>
        </div>

        <div className="space-y-4">
          {Object.entries(chatHistory).map(([pdfName, messages]) => (
            <div key={pdfName} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={20} />
                <h3 className="font-medium truncate">{pdfName}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MessageSquare size={16} />
                <span>{messages.length} messages</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;