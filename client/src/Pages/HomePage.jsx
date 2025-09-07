import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Brain,
    BarChart as FlowChart,
    MessageSquare,
    Upload,
    Sparkles,
    ArrowRight,
    CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800/30 backdrop-blur-md rounded-xl p-6 hover:bg-gray-800/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] border border-gray-700/50"
    >
        <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Icon className="text-blue-500" size={24} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </motion.div>
);

const FloatingIcon = ({ icon: Icon, delay, className }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
            delay,
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
        }}
        className={`absolute hidden lg:block ${className}`}
    >
        <Icon className="text-blue-500/20" size={40} />
    </motion.div>
);

const LandingPage = ({ onGetStarted }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // If user is already authenticated, redirect to dashboard
        if (isAuthenticated()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen text-white overflow-hidden relative">
            {/* Smooth Multi-layer Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-black" />
            <div className="fixed inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-purple-900/10" />
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
            <div className="fixed inset-0 bg-gradient-to-r from-transparent via-blue-900/5 to-transparent" />
            
            {/* Animated Background Orbs for Smooth Effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-400/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
                <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
                <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-cyan-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '8s' }} />
            </div>

            {/* Content Container with relative positioning */}
            <div className="relative z-10">
                {/* Hero Section */}
                <div className="relative">
                    {/* Floating Background Icons */}
                    <FloatingIcon icon={FileText} delay={0} className="top-20 left-[15%]" />
                    <FloatingIcon icon={Brain} delay={0.2} className="top-40 right-[20%]" />
                    <FloatingIcon icon={MessageSquare} delay={0.4} className="bottom-20 left-[25%]" />
                    <FloatingIcon icon={FlowChart} delay={0.6} className="top-60 right-[10%]" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center relative z-10"
                        >
                            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-500 to-white">
                                LexiAI
                            </h1>

                            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                                Transform your PDFs into interactive conversations. Extract insights, generate summaries, and visualize content with AI-powered analysis.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/login')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center gap-2 group transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Get Started Free
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>

                                <a
                                    href="#features"
                                    className="bg-gray-800/30 backdrop-blur-sm hover:bg-gray-800/50 text-white px-8 py-4 rounded-xl transition-all flex items-center gap-2 border border-gray-700/50"
                                >
                                    See Features
                                    <motion.div
                                        animate={{ y: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        ↓
                                    </motion.div>
                                </a>
                            </div>

                            {/* Quick Benefits */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-sm">
                                {[
                                    'No credit card required',
                                    'Free tier available',
                                    'Process PDFs instantly'
                                ].map((benefit, index) => (
                                    <div key={index} className="flex items-center justify-center gap-2 text-gray-300">
                                        <CheckCircle size={16} className="text-blue-500" />
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Features Section */}
                <section id="features" className="py-32 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-block mb-4"
                            >
                                <div className="bg-blue-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/20">
                                    <span className="text-blue-500 font-medium">Powerful Features</span>
                                </div>
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything You Need</h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                                A complete toolkit for analyzing and understanding your PDF documents
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={Brain}
                                title="AI-Powered Analysis"
                                description="Ask questions about your documents and get intelligent, context-aware responses powered by advanced AI."
                            />
                            <FeatureCard
                                icon={MessageSquare}
                                title="Interactive Chat"
                                description="Engage in natural conversations about your documents with our AI assistant."
                            />
                            <FeatureCard
                                icon={FlowChart}
                                title="Visual Flowcharts"
                                description="Automatically generate visual flowcharts to better understand document structure and relationships."
                            />
                            <FeatureCard
                                icon={Upload}
                                title="Easy Upload"
                                description="Simply drag and drop your PDFs or click to upload. We handle the rest."
                            />
                            <FeatureCard
                                icon={Sparkles}
                                title="Smart Summaries"
                                description="Get instant, AI-generated summaries of your documents, saving you time and effort."
                            />
                            <FeatureCard
                                icon={FileText}
                                title="Chat History"
                                description="Access your previous conversations and analyses, organized by document."
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-2xl p-12 shadow-[0_0_50px_rgba(59,130,246,0.1)]"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
                            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                                Join thousands of users who are already experiencing the power of AI-driven PDF analysis.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center gap-2 group transition-colors mx-auto shadow-lg shadow-blue-500/20"
                            >
                                Get Started Now
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-gray-800/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="text-blue-500" />
                                <span className="font-semibold">LexiAI</span>
                            </div>
                            <div className="flex items-center gap-8 text-gray-400">
                                <a href="https://github.com/AdityaKrSingh26" className="hover:text-white transition-colors">Contact</a>
                            </div>
                            <p className="text-gray-400 text-sm">
                                © 2024 LexiAI. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;