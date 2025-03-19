import React, { useEffect } from 'react';
import {
  Menu,
  X,
  MessageSquare,
  FileText,
  Trash2,
  Calendar,
  PlusCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import useChatStore from '../utils/chatStore';

const Sidebar = ({ isOpen, toggleSidebar, userId }) => {
  const {
    pdfs,
    fetchPDFs,
    setCurrentPdf,
    deletePDF,
    clearChat
  } = useChatStore();

  const handleNewChat = () => {
    clearChat();
  };

  useEffect(() => {
    if (userId) {
      fetchPDFs(userId);
    }
  }, [fetchPDFs, userId]);

  const handlePDFClick = (pdf) => {
    setCurrentPdf(pdf);
  };

  const handleDeletePDF = async (e, pdfId) => {
    e.stopPropagation(); // Prevent triggering the parent div's onClick
    try {
      await deletePDF(pdfId);
      // Refresh PDFs list after deletion
      if (userId) {
        fetchPDFs(userId);
      }
    } catch (error) {
      console.error('Error deleting PDF:', error);
      // You might want to add a toast notification here
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg"
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
        {/* Add New Chat button */}


        <div className="flex items-center justify-between mb-8">
          <h2 className="w-[100%] text-2xl font-bold text-right">History</h2>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full mb-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <PlusCircle size={20} />
          <span>New Chat</span>
        </button>

        {/* PDFs list */}
        <div className="space-y-4">
          {pdfs && pdfs.map((pdf) => (
            <div
              key={pdf._id}
              onClick={() => handlePDFClick(pdf)}
              className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors group relative"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText size={20} />
                <h3 className="font-medium truncate">{pdf.title}</h3>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={16} />
                    <span>{formatDate(pdf.createdAt)}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeletePDF(e, pdf._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-600/30"
                    title="Delete PDF"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            </div>
          ))}

          {pdfs && pdfs.length === 0 && (
            <div className="text-center text-gray-500">
              No documents found
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;