import React, { useEffect, useState } from 'react';
import {
  Menu,
  X,
  MessageSquare,
  FileText,
  Trash2,
  Calendar,
  PlusCircle,
  LogOut,
  Star,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../utils/chatStore';

const Sidebar = ({ isOpen, toggleSidebar, userId }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    pdfs,
    fetchPDFs,
    setCurrentPdf,
    deletePDF,
    clearChat,
    startNewChatWithCurrentPdf,
    isLoading
  } = useChatStore();

  useEffect(() => {
    // Only fetch PDFs if we don't have them already and not currently loading
    if (userId && pdfs.length === 0 && !isLoading) {
      fetchPDFs(userId);
    }
  }, [fetchPDFs, userId, pdfs.length, isLoading]);

  const handleNewChat = () => {
    // Clear current PDF and messages to start completely fresh
    setCurrentPdf(null);
  };

  const handlePDFClick = (pdf) => {
    setCurrentPdf(pdf);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeletePDF = async (e, pdfId) => {
    e.stopPropagation();
    
    // Find the PDF to get its title for confirmation
    const pdfToDelete = pdfs.find(pdf => pdf._id === pdfId);
    const confirmMessage = `Are you sure you want to delete "${pdfToDelete?.title || 'this document'}"? This will also delete all associated chats. This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await deletePDF(pdfId);
      if (userId) {
        fetchPDFs(userId);
      }
      // Show success message
      alert(`"${pdfToDelete?.title || 'Document'}" has been successfully deleted.`);
    } catch (error) {
      console.error('Error deleting PDF:', error);
      alert('Failed to delete the document. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredPDFs = pdfs.filter(pdf =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed border-r-2 border-gray-700 top-0 left-0 h-full w-72 bg-gray-900 text-white p-6 shadow-2xl z-40 overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">LexiAI</h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 mb-6">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <PlusCircle size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Recent Documents */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Recent Documents</h3>
          <div className="space-y-2">
            {filteredPDFs.slice(0, 10).map((pdf) => (
              <div
                key={pdf._id}
                onClick={() => handlePDFClick(pdf)}
                className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-gray-400" />
                  <h3 className="text-sm font-medium truncate flex-1">{pdf.title}</h3>
                  {pdf.isFavorite && <Star size={12} className="text-yellow-500" />}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formatDate(pdf.createdAt)}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeletePDF(e, pdf._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400"
                    title="Delete PDF"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Tags */}
                {pdf.tags && pdf.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pdf.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {pdf.tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{pdf.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filteredPDFs.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                No documents found
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

    </>
  );
};

export default Sidebar;