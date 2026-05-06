import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    GitBranch as FlowChart,
    BookOpen,
    Home,
    Menu,
    FileText,
    Files,
    MessageSquare,
    FolderOpen,
    User,
    X,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import PDFUploader from '../components/PDFUploader';
import FlowchartPopup from '../components/FlowchartPopup';
import NotesPopup from '../components/NotesPopup';
import MultiDocSelector from '../components/MultiDocSelector';
import { getUser, isAuthenticated } from '../utils/auth';
import useChatStore from '../utils/chatStore';
import { ChatInput } from '../components/ui/chat-input';

function App() {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFlowchartOpen, setIsFlowchartOpen] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [uploadTriggered, setUploadTriggered] = useState(false);
    const [flowchartCode, setFlowchartCode] = useState(null);
    const [userId, setUserId] = useState(null);

    const {
        messages,
        isLoading,
        isUploading,
        currentPdf,
        pdfs,
        fetchPDFs,
        setCurrentPdf,
        askQuestionStream,
        askMultiDocQuestion,
        startNewChatWithCurrentPdf,
        chatMode,
        setChatMode,
        selectedPdfIds,
        generateFlow,
    } = useChatStore();

    useEffect(() => {
        if (!isAuthenticated()) { navigate('/login'); return; }
        const user = getUser();
        if (user?.id) setUserId(user.id);
        else navigate('/login');
    }, [navigate]);

    useEffect(() => {
        const docId = searchParams.get('doc') || searchParams.get('pdf');
        const shouldUpload = searchParams.get('upload');
        if (docId && userId && pdfs.length > 0) {
            const target = pdfs.find(p => p._id === docId);
            if (target && (!currentPdf || currentPdf._id !== docId)) {
                setCurrentPdf(target);
                setSearchParams({});
            } else if (!target) setSearchParams({});
        } else if (shouldUpload === 'true' && !uploadTriggered) {
            setUploadTriggered(true);
            setTimeout(() => {
                document.querySelector('[data-upload-trigger]')?.click();
            }, 500);
            setSearchParams({});
        }
    }, [searchParams, userId, pdfs, currentPdf, setCurrentPdf, setSearchParams, uploadTriggered]);

    useEffect(() => { if (userId) fetchPDFs(); }, [userId]);
    useEffect(() => () => setUploadTriggered(false), [userId]);
    useEffect(() => { if (!currentPdf) setUploadTriggered(false); setFlowchartCode(null); }, [currentPdf?._id]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text) => {
        if (!text.trim() || isUploading || isLoading) return;
        if (chatMode === 'multi') {
            if (selectedPdfIds.length === 0) return;
            await askMultiDocQuestion(text);
        } else {
            if (!currentPdf) return;
            await askQuestionStream(text);
        }
    };

    const isChatDisabled = (chatMode === 'single' && !currentPdf) ||
        (chatMode === 'multi' && selectedPdfIds.length === 0) || isUploading;

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userId={userId} />

            {/* Header */}
            <header className={`fixed top-0 right-0 z-30 transition-all duration-300 ${isSidebarOpen ? 'lg:left-72' : 'left-0'} bg-black/40 backdrop-blur-xl border-b border-white/[0.05]`}>
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-white/40 hover:text-white/80 hover:bg-white/[0.05] rounded-lg transition-all"
                        >
                            <Menu size={18} />
                        </button>

                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-violet-400" />
                            <span className="text-sm font-semibold text-white/80">LexiAI</span>
                            <span className="text-white/20 text-sm">/</span>
                            <span className="text-sm text-white/40">Chat</span>
                            {currentPdf && (
                                <>
                                    <span className="text-white/20 text-sm hidden sm:block">/</span>
                                    <span className="text-sm text-violet-400/80 font-medium hidden sm:block truncate max-w-32 lg:max-w-48">
                                        {currentPdf.title}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Action buttons */}
                        <button
                            onClick={() => setIsNotesOpen(true)}
                            disabled={!currentPdf}
                            className="p-2 text-white/30 hover:text-white/70 hover:bg-white/[0.05] rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Document Notes"
                        >
                            <BookOpen size={16} />
                        </button>
                        <button
                            onClick={async () => {
                                if (!currentPdf) return;
                                setIsFlowchartOpen(true);
                                if (!flowchartCode) {
                                    const code = await generateFlow(currentPdf._id);
                                    setFlowchartCode(code);
                                }
                            }}
                            disabled={!currentPdf}
                            className="p-2 text-white/30 hover:text-white/70 hover:bg-white/[0.05] rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                            title="Generate Flowchart"
                        >
                            <FlowChart size={16} />
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 text-white/30 hover:text-white/70 hover:bg-white/[0.05] rounded-lg transition-all"
                            title="Dashboard"
                        >
                            <Home size={16} />
                        </button>

                        <div className="w-px h-5 bg-white/[0.07] mx-1" />

                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 text-white/40 hover:text-white/80 hover:bg-white/[0.05] rounded-lg transition-all"
                        >
                            {showMobileMenu ? <X size={16} /> : <Menu size={16} />}
                        </button>

                        {/* User avatar */}
                        <div className="hidden md:flex items-center gap-2 pl-1">
                            <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                                <User size={14} className="text-violet-400" />
                            </div>
                            <span className="text-sm text-white/50 hidden lg:block">{getUser()?.username}</span>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {showMobileMenu && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-white/[0.05] px-4 py-3 space-y-1 md:hidden"
                        >
                            {[
                                { icon: Home, label: 'Dashboard', action: () => navigate('/dashboard') },
                                { icon: FolderOpen, label: 'Collections', action: () => navigate('/dashboard') },
                            ].map(({ icon: Icon, label, action }) => (
                                <button
                                    key={label}
                                    onClick={() => { action(); setShowMobileMenu(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-white/50 hover:text-white/80 hover:bg-white/[0.04] rounded-lg transition-all text-sm text-left"
                                >
                                    <Icon size={16} />
                                    {label}
                                </button>
                            ))}
                            {currentPdf && (
                                <button
                                    onClick={() => { setIsNotesOpen(true); setShowMobileMenu(false); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-white/50 hover:text-white/80 hover:bg-white/[0.04] rounded-lg transition-all text-sm text-left"
                                >
                                    <BookOpen size={16} />
                                    Document Notes
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Main content */}
            <main className={`flex-1 transition-all duration-300 pt-[57px] pb-0 ${isSidebarOpen ? 'lg:ml-72' : ''}`}>
                <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col min-h-[calc(100vh-57px)]">
                    {/* PDF Uploader */}
                    <PDFUploader />

                    {/* Welcome screen */}
                    {!currentPdf && chatMode === 'single' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 flex flex-col items-center justify-center text-center py-20"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                                <BookOpen size={24} className="text-violet-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white/80 mb-2">Welcome to LexiAI Chat</h2>
                            <p className="text-sm text-white/30 mb-8 max-w-sm leading-relaxed">
                                Upload a PDF or select one from your documents to start an intelligent conversation.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white/80 rounded-xl border border-white/[0.07] text-sm transition-all"
                                >
                                    <FolderOpen size={15} />
                                    Browse Documents
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-xl border border-violet-500/20 text-sm transition-all"
                                >
                                    <MessageSquare size={15} />
                                    View Dashboard
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Document info bar */}
                    {currentPdf && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 px-4 py-3 bg-white/[0.02] rounded-xl border border-white/[0.05] flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                    <BookOpen size={14} className="text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white/80 truncate max-w-48 lg:max-w-80">{currentPdf.title}</p>
                                    <p className="text-xs text-white/25">
                                        {currentPdf.fileSize ? `${(currentPdf.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                                        {currentPdf.uploadedAt ? ` · ${new Date(currentPdf.uploadedAt).toLocaleDateString()}` : ''}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={startNewChatWithCurrentPdf}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg border border-white/[0.06] transition-all"
                            >
                                <MessageSquare size={12} />
                                New Chat
                            </button>
                        </motion.div>
                    )}

                    {/* Chat messages */}
                    <div className="flex-1 space-y-1 pb-4">
                        {messages.map((msg, idx) => (
                            <ChatMessage
                                key={idx}
                                message={msg.content}
                                type={msg.type}
                                metadata={msg.metadata}
                                searchMetadata={msg.searchMetadata}
                                isStreaming={msg.isStreaming}
                                sourcePdfs={msg.sourcePdfs}
                                isMultiDoc={msg.isMultiDoc}
                            />
                        ))}
                        {(isLoading || isUploading) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-1.5 px-4 py-3"
                            >
                                {[0, 0.15, 0.3].map((delay, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-violet-500/60"
                                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                                        transition={{ duration: 1.2, repeat: Infinity, delay }}
                                    />
                                ))}
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat input — sticky at bottom */}
                    <div className="sticky bottom-0 pb-6 pt-2 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent">
                        <ChatInput
                            onSend={handleSend}
                            isLoading={isLoading}
                            disabled={isChatDisabled}
                            chatMode={chatMode}
                            selectedPdfIds={selectedPdfIds}
                            currentPdf={currentPdf}
                            onChangeChatMode={setChatMode}
                            extraContent={chatMode === 'multi' ? <MultiDocSelector /> : null}
                        />
                    </div>
                </div>
            </main>

            <FlowchartPopup isOpen={isFlowchartOpen} onClose={() => setIsFlowchartOpen(false)} mermaidCode={flowchartCode} />
            <NotesPopup isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} currentPdf={currentPdf} />
        </div>
    );
}

export default App;
