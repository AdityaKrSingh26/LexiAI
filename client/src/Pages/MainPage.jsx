import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch as FlowChart } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import PDFUploader from '../components/PDFUploader';
import FlowchartPopup from '../components/FlowchartPopup';
import useChatStore from '../utils/chatStore';

const flowchartImage = '/flowchart.png';

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFlowchartOpen, setIsFlowchartOpen] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const {
        messages,
        isLoading,
        isUploading,
        currentPdf,
        askQuestion: sendQuestion
    } = useChatStore();

    // Get userId from localStorage when component mounts
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedUserId = storedUser ? JSON.parse(storedUser).id : null;
        console.log(storedUserId);
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !currentPdf || isUploading || !userId) return;

        await sendQuestion(inputMessage, userId);
        setInputMessage('');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} /> */}

            <main className={`min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : ''}`}>
                <div className="container mx-auto px-4 py-8">
                    <PDFUploader />

                    <div className="max-w-4xl mx-auto">
                        {/* Chat Messages */}
                        <div className=" rounded-lg p-4 mb-10">
                            {messages.map((msg, idx) => (
                                <ChatMessage
                                    key={idx}
                                    message={msg.content}
                                    type={msg.type}
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

            {/* Floating Flowchart Button */}
            <button
                onClick={() => setIsFlowchartOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-20"
                aria-label="Show document flowchart"
            >
                <FlowChart size={24} />
            </button>

            {/* Flowchart Popup */}
            <FlowchartPopup
                isOpen={isFlowchartOpen}
                onClose={() => setIsFlowchartOpen(false)}
                flowchartImage={flowchartImage}
            />
        </div>
    );
}

export default App;