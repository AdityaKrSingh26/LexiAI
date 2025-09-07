import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    GitBranch as FlowChart,
    BookOpen,
    BarChart3,
    Home,
    Settings,
    User,
    FolderOpen,
    Search,
    Star,
    Clock,
    Menu,
    MessageSquare
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import PDFUploader from '../components/PDFUploader';
import FlowchartPopup from '../components/FlowchartPopup';
import NotesPopup from '../components/NotesPopup';
import SemanticSearchInfo from '../components/SemanticSearchInfo';
import { getUser, isAuthenticated } from '../utils/auth';

import useChatStore from '../utils/chatStore';

const flowchartImage = '/flowchart.png';

const mermaidCode = "graph TD\n  A[Client] -->|Request| B(Gateway)\n  B --> C[Server]\n  C -->|Response| B\n  B --> D[Database]";


function App() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFlowchartOpen, setIsFlowchartOpen] = useState(false);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [uploadTriggered, setUploadTriggered] = useState(false);
    
    const {
        messages,
        isLoading,
        isUploading,
        currentPdf,
        pdfs,
        fetchPDFs,
        setCurrentPdf,
        askQuestion: sendQuestion,
        startNewChatWithCurrentPdf
    } = useChatStore();

    // Get userId from localStorage when component mounts
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Validate authentication on component mount
        if (!isAuthenticated()) {
            console.warn('🚫 User not authenticated, redirecting to login');
            navigate('/login');
            return;
        }

        const user = getUser();
        if (user?.id) {
            setUserId(user.id);
            console.log('✅ User authenticated:', user.email);
        } else {
            console.error('❌ Invalid user data, redirecting to login');
            navigate('/login');
        }
    }, [navigate]);

    // Handle PDF loading from URL parameter
    useEffect(() => {
        const docId = searchParams.get('doc') || searchParams.get('pdf');
        const shouldUpload = searchParams.get('upload');
        
        if (docId && userId && pdfs.length > 0) {
            // Find the PDF in the loaded PDFs
            const targetPdf = pdfs.find(pdf => pdf._id === docId);
            if (targetPdf && (!currentPdf || currentPdf._id !== docId)) {
                console.log('📄 Loading PDF from URL:', targetPdf.title);
                setCurrentPdf(targetPdf);
                // Remove the doc parameter from URL after loading
                setSearchParams({});
            } else if (!targetPdf) {
                console.warn('⚠️ PDF not found with ID:', docId);
                // Remove invalid doc parameter
                setSearchParams({});
            }
        } else if (shouldUpload === 'true' && !uploadTriggered) {
            console.log('Auto-triggering upload dialog due to upload parameter');
            setUploadTriggered(true);
            // Trigger upload dialog after a short delay to ensure page is loaded
            setTimeout(() => {
                const uploadElement = document.querySelector('[data-upload-trigger]');
                if (uploadElement) {
                    uploadElement.click();
                }
            }, 500);
            // Remove the upload parameter from URL
            setSearchParams({});
        }
    }, [searchParams, userId, pdfs, currentPdf, setCurrentPdf, setSearchParams, uploadTriggered]);

    // Load PDFs when user is authenticated
    useEffect(() => {
        // Only fetch PDFs if we don't have them already and not currently loading
        if (userId && pdfs.length === 0 && !isLoading) {
            fetchPDFs(userId);
        }
    }, [userId, fetchPDFs, pdfs.length, isLoading]);

    // Reset upload trigger when component unmounts or user changes
    useEffect(() => {
        return () => {
            setUploadTriggered(false);
        };
    }, [userId]);

    // Reset upload trigger when starting a new chat (currentPdf becomes null)
    useEffect(() => {
        if (!currentPdf) {
            setUploadTriggered(false);
        }
    }, [currentPdf]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !currentPdf || isUploading || !userId) return;

        await sendQuestion(inputMessage, userId);
        setInputMessage('');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userId={userId} />

            {/* Dashboard Navigation Header */}
            <div className={`fixed top-0 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : ''}`}>
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Left Side - Logo and Navigation */}
                        <div className="flex items-center gap-6">
                            {!isSidebarOpen && (
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <Menu size={20} />
                                </button>
                            )}
                            
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-white">LexiAI</h1>
                                <span className="text-sm text-gray-400">Chat</span>
                            </div>

                            {/* Navigation Links */}
                            <nav className="hidden md:flex items-center gap-1">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <Home size={16} />
                                    <span className="text-sm">Dashboard</span>
                                </button>
                                
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <FolderOpen size={16} />
                                    <span className="text-sm">Collections</span>
                                </button>

                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <BarChart3 size={16} />
                                    <span className="text-sm">Analytics</span>
                                </button>
                            </nav>
                        </div>

                        {/* Right Side - Current Document Info & User Menu */}
                        <div className="flex items-center gap-4">
                            {/* Current Document Info */}
                            {currentPdf && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700"
                                >
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-300 max-w-32 lg:max-w-48 truncate">
                                        {currentPdf.title}
                                    </span>
                                </motion.div>
                            )}

                            {/* Quick Actions */}
                            <div className="hidden lg:flex items-center gap-2">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                    title="Search Documents"
                                >
                                    <Search size={18} />
                                </button>
                                
                                <button
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                    title="Recent Activity"
                                >
                                    <Clock size={18} />
                                </button>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <Menu size={18} />
                            </button>

                            {/* User Info */}
                            <div className="hidden md:flex items-center gap-2">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm text-white font-medium">{getUser()?.username}</p>
                                    <p className="text-xs text-gray-400">{getUser()?.email}</p>
                                </div>
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <User size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm"
                    >
                        <div className="px-4 py-3 space-y-2">
                            <button
                                onClick={() => {
                                    navigate('/dashboard');
                                    setShowMobileMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
                            >
                                <Home size={18} />
                                <span>Dashboard</span>
                            </button>
                            
                            <button
                                onClick={() => {
                                    navigate('/dashboard');
                                    setShowMobileMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
                            >
                                <FolderOpen size={18} />
                                <span>Collections</span>
                            </button>

                            <button
                                onClick={() => {
                                    navigate('/dashboard');
                                    setShowMobileMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
                            >
                                <BarChart3 size={18} />
                                <span>Analytics</span>
                            </button>

                            <button
                                onClick={() => {
                                    navigate('/dashboard');
                                    setShowMobileMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
                            >
                                <Search size={18} />
                                <span>Search Documents</span>
                            </button>

                            {currentPdf && (
                                <button
                                    onClick={() => {
                                        setIsNotesOpen(true);
                                        setShowMobileMenu(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
                                >
                                    <BookOpen size={18} />
                                    <span>Document Notes</span>
                                </button>
                            )}

                            {/* User Info for Mobile */}
                            <div className="pt-2 mt-2 border-t border-gray-800">
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">{getUser()?.username}</p>
                                        <p className="text-xs text-gray-400">{getUser()?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <main className={`min-h-screen transition-all duration-300 pt-16 ${isSidebarOpen ? 'lg:ml-72' : ''}`}>
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb Navigation */}
                    <div className="mb-6">
                        <nav className="flex items-center space-x-2 text-sm">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Dashboard
                            </button>
                            <span className="text-gray-600">/</span>
                            <span className="text-white">Chat</span>
                            {currentPdf && (
                                <>
                                    <span className="text-gray-600">/</span>
                                    <span className="text-blue-400 font-medium">{currentPdf.title}</span>
                                </>
                            )}
                        </nav>
                    </div>

                    <PDFUploader />

                    <div className="max-w-4xl mx-auto">
                        {/* Document Context Panel */}
                        {currentPdf && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                            <BookOpen className="text-blue-400" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">{currentPdf.title}</h3>
                                            <p className="text-sm text-gray-400">
                                                {currentPdf.fileSize ? `${(currentPdf.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • 
                                                {currentPdf.uploadedAt ? ` Uploaded ${new Date(currentPdf.uploadedAt).toLocaleDateString()}` : ' Recently uploaded'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startNewChatWithCurrentPdf()}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg transition-colors"
                                            title="Start a new conversation with this document"
                                        >
                                            <MessageSquare size={14} />
                                            New Chat
                                        </button>
                                        
                                        <button
                                            onClick={() => setIsNotesOpen(true)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg transition-colors"
                                        >
                                            <BookOpen size={14} />
                                            Notes
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Welcome Message for No Document */}
                        {!currentPdf && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 text-center py-12"
                            >
                                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="text-blue-400" size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-white mb-2">Welcome to LexiAI Chat</h2>
                                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                    Upload a document to start having intelligent conversations with your content, or browse your existing documents.
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                    >
                                        <FolderOpen size={16} />
                                        Browse Documents
                                    </button>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <BarChart3 size={16} />
                                        View Dashboard
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Semantic Search Info - Show when there's a current PDF */}
                        {currentPdf && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                <SemanticSearchInfo currentPdf={currentPdf} />
                            </motion.div>
                        )}

                        {/* Chat Messages */}
                        <div className=" rounded-lg p-4 mb-10">
                            {messages.map((msg, idx) => (
                                <ChatMessage
                                    key={idx}
                                    message={msg.content}
                                    type={msg.type}
                                    metadata={msg.metadata}
                                    searchMetadata={msg.searchMetadata}
                                />
                            ))}

                            {(isLoading || isUploading) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-2 justify-center items-center p-4"
                                >
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                                </motion.div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="fixed bottom-10 left-10 right-10 bg-gray-900 px-4 border-t border-gray-800">
                            <div className="max-w-4xl mx-auto">
                                <form onSubmit={handleSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder={currentPdf ? "Ask a question about your PDF..." : "Upload a PDF to start chatting"}
                                        className="flex-1 bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={!currentPdf || isUploading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!currentPdf || isUploading}
                                        className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Buttons Container */}
            <div className="fixed bottom-24 right-6 flex flex-col gap-4 z-20">
                {/* Dashboard Quick Access Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-4 rounded-full shadow-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    aria-label="Go to Dashboard"
                    title="Dashboard"
                >
                    <Home size={24} />
                </button>

                {/* Notes Button */}
                <button
                    onClick={() => setIsNotesOpen(true)}
                    className={`p-4 rounded-full shadow-lg transition-colors ${currentPdf
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                        }`}
                    aria-label="Open notes"
                    disabled={!currentPdf}
                    title="Document Notes"
                >
                    <BookOpen size={24} />
                </button>

                {/* Analytics Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-4 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                    aria-label="View Analytics"
                    title="Analytics"
                >
                    <BarChart3 size={24} />
                </button>

                {/* Flowchart Button */}
                {/* <button
                    onClick={() => setIsFlowchartOpen(true)}
                    className={`p-4 rounded-full shadow-lg transition-colors ${currentPdf
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                        }`}
                    aria-label="Show document flowchart"
                    disabled={!currentPdf}
                >
                    <FlowChart size={24} />
                </button> */}
            </div>

            {/* Flowchart Popup */}
            {/* <FlowchartPopup
                isOpen={isFlowchartOpen}
                onClose={() => setIsFlowchartOpen(false)}
                mermaidCode={mermaidCode}
            /> */}

            <NotesPopup
                isOpen={isNotesOpen}
                onClose={() => setIsNotesOpen(false)}
                currentPdf={currentPdf}
            />
        </div>
    );
}

export default App;