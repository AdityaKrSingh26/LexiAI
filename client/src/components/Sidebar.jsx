import React, { useState } from 'react';
import {
  X,
  FileText,
  Trash2,
  PlusCircle,
  LogOut,
  Star,
  Search,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../utils/chatStore';

const Sidebar = ({ isOpen, toggleSidebar, userId }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { pdfs, fetchPDFs, setCurrentPdf, currentPdf, deletePDF } = useChatStore();

  const handleNewChat = () => setCurrentPdf(null);

  const handlePDFClick = (pdf) => {
    setCurrentPdf(pdf);
    if (window.innerWidth < 1024) toggleSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleDeletePDF = async (e, pdfId) => {
    e.stopPropagation();
    const pdf = pdfs.find(p => p._id === pdfId);
    if (!window.confirm(`Delete "${pdf?.title || 'this document'}"? This cannot be undone.`)) return;
    try {
      await deletePDF(pdfId);
      fetchPDFs();
    } catch {
      alert('Failed to delete. Please try again.');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const filtered = pdfs.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      {/* Backdrop (mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.div
        initial={{ x: -288 }}
        animate={{ x: isOpen ? 0 : -288 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-72 z-40 flex flex-col bg-[#0A0A0B] border-r border-white/[0.05]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-violet-600/20 border border-violet-500/30">
              <Sparkles size={11} className="text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-white/80">LexiAI</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-white/30 hover:text-white/70 hover:bg-white/[0.05] rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-violet-500/30 transition-all"
            />
          </div>
        </div>

        {/* New Chat */}
        <div className="px-3 pb-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-white/60 hover:text-white/90 rounded-xl text-sm transition-all"
          >
            <PlusCircle size={15} className="text-violet-400" />
            New Chat
          </button>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-2 px-1">
            Recent Documents
          </p>
          <div className="space-y-1">
            {filtered.slice(0, 10).map((pdf) => {
              const isActive = currentPdf?._id === pdf._id;
              return (
                <div
                  key={pdf._id}
                  onClick={() => handlePDFClick(pdf)}
                  className={`group relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-violet-500/10 border border-violet-500/20'
                      : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <FileText size={14} className={isActive ? 'text-violet-400 flex-shrink-0 mt-0.5' : 'text-white/25 flex-shrink-0 mt-0.5'} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${isActive ? 'text-white/90' : 'text-white/60'}`}>
                      {pdf.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-white/20">{formatDate(pdf.createdAt)}</span>
                      {pdf.isFavorite && <Star size={9} className="text-yellow-500/60" />}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeletePDF(e, pdf._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 transition-all flex-shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <p className="text-xs text-white/20 text-center py-6">No documents found</p>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-white/[0.05] pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-white/25 hover:text-red-400 hover:bg-red-500/[0.06] rounded-xl text-sm transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
