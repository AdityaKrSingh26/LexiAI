import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, GitBranch, MessageSquare, Upload, Sparkles, FileText, ArrowRight, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const MONO = { fontFamily: "'JetBrains Mono', 'Courier New', monospace" };

const features = [
    { icon: Brain, title: 'AI-Powered Analysis', description: 'Ask questions about your documents and get intelligent, context-aware responses powered by advanced AI.' },
    { icon: MessageSquare, title: 'Interactive Chat', description: 'Engage in natural conversations about your documents with our AI assistant.' },
    { icon: GitBranch, title: 'Visual Flowcharts', description: 'Automatically generate visual flowcharts to better understand document structure.' },
    { icon: Upload, title: 'Easy Upload', description: 'Drag and drop your PDFs or click to upload. We handle the rest.' },
    { icon: Sparkles, title: 'Smart Summaries', description: 'Get instant AI-generated summaries of your documents, saving you time and effort.' },
    { icon: FileText, title: 'Chat History', description: 'Access your previous conversations and analyses, organized by document.' },
];

const Cursor = () => {
    const [on, setOn] = useState(true);
    useEffect(() => {
        const t = setInterval(() => setOn(p => !p), 530);
        return () => clearInterval(t);
    }, []);
    return <span style={{ color: '#FFB800', opacity: on ? 1 : 0 }}>█</span>;
};

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated()) navigate('/dashboard');
    }, [navigate]);

    return (
        <div style={{ ...MONO, background: '#080705', color: '#F0E6CC', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Grid background */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(#1A1508 1px, transparent 1px), linear-gradient(90deg, #1A1508 1px, transparent 1px)',
                backgroundSize: '48px 48px', opacity: 0.5,
            }} />

            {/* Nav */}
            <nav style={{ position: 'relative', zIndex: 10, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2A2010' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={16} style={{ color: '#FFB800' }} />
                    <span style={{ color: '#FFB800', fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em' }}>LEXIAI</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            ...MONO,
                            padding: '7px 16px',
                            background: 'transparent',
                            border: '1px solid #2A2010',
                            color: '#8A7A60',
                            fontSize: '11px',
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5A4A30'; e.currentTarget.style.color = '#F0E6CC'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2010'; e.currentTarget.style.color = '#8A7A60'; }}
                    >
                        SIGN IN
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            ...MONO,
                            padding: '7px 16px',
                            background: '#FFB800',
                            border: 'none',
                            color: '#080705',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#FFC933')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#FFB800')}
                    >
                        GET STARTED
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', padding: '100px 32px 80px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', border: '1px solid #2A2010', marginBottom: '32px' }}>
                        <span style={{ width: '6px', height: '6px', background: '#FFB800', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                        <span style={{ color: '#8A7A60', fontSize: '11px', letterSpacing: '0.15em' }}>AI-POWERED PDF ANALYSIS</span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, lineHeight: 1, marginBottom: '8px', color: '#FFB800', letterSpacing: '-0.02em' }}>
                        LEXI<span style={{ color: '#F0E6CC' }}>AI</span>
                    </h1>

                    <div style={{ fontSize: '14px', color: '#5A4A30', marginBottom: '48px', lineHeight: 1.8 }}>
                        <span style={{ color: '#8A7A60' }}>$ </span>
                        <span style={{ color: '#F0E6CC' }}>Transform PDFs into intelligent conversations</span>
                        <br />
                        <span style={{ color: '#8A7A60' }}>$ </span>
                        <span>Extract insights, generate summaries, visualize content</span>
                        <br />
                        <span style={{ color: '#8A7A60' }}>$ </span>
                        <Cursor />
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '48px' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                ...MONO,
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 24px',
                                background: '#FFB800',
                                border: 'none',
                                color: '#080705',
                                fontSize: '12px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFC933')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFB800')}
                        >
                            GET STARTED FREE
                            <ArrowRight size={14} />
                        </button>
                        <a
                            href="#features"
                            style={{
                                ...MONO,
                                display: 'inline-flex', alignItems: 'center',
                                padding: '12px 24px',
                                background: 'transparent',
                                border: '1px solid #2A2010',
                                color: '#8A7A60',
                                fontSize: '12px',
                                letterSpacing: '0.1em',
                                textDecoration: 'none',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5A4A30'; e.currentTarget.style.color = '#F0E6CC'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2010'; e.currentTarget.style.color = '#8A7A60'; }}
                        >
                            SEE FEATURES
                        </a>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                        {['No credit card required', 'Free tier available', 'Process PDFs instantly'].map((b) => (
                            <span key={b} style={{ color: '#5A4A30', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#FFB800' }}>✓</span> {b}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #2A2010', position: 'relative', zIndex: 10 }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px' }}>
                    <span style={{ display: 'inline-block', background: '#080705', padding: '0 12px', transform: 'translateY(-50%)', color: '#3A3020', fontSize: '10px', letterSpacing: '0.2em' }}>
                        CAPABILITIES
                    </span>
                </div>
            </div>

            {/* Features */}
            <section id="features" style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', padding: '48px 32px 80px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ marginBottom: '40px' }}
                >
                    <p style={{ color: '#5A4A30', fontSize: '10px', letterSpacing: '0.25em', marginBottom: '8px' }}>FEATURES</p>
                    <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#F0E6CC', letterSpacing: '-0.02em' }}>Everything you need</h2>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: '#2A2010' }}>
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            style={{ background: '#080705', padding: '28px 24px', transition: 'background 0.15s', cursor: 'default' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#0C0A06')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#080705')}
                        >
                            <f.icon size={18} style={{ color: '#FFB800', marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#F0E6CC', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                                {f.title}
                            </h3>
                            <p style={{ fontSize: '12px', color: '#5A4A30', lineHeight: 1.7 }}>{f.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ position: 'relative', zIndex: 10, borderTop: '1px solid #2A2010', borderBottom: '1px solid #2A2010' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <p style={{ color: '#5A4A30', fontSize: '10px', letterSpacing: '0.25em', marginBottom: '16px' }}>GET STARTED</p>
                        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#F0E6CC', marginBottom: '12px' }}>Ready to begin?</h2>
                        <p style={{ color: '#5A4A30', fontSize: '13px', marginBottom: '32px' }}>
                            Join users experiencing AI-driven PDF analysis.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                ...MONO,
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '14px 32px',
                                background: '#FFB800',
                                border: 'none',
                                color: '#080705',
                                fontSize: '12px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFC933')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFB800')}
                        >
                            GET STARTED NOW <ArrowRight size={14} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ position: 'relative', zIndex: 10, padding: '24px 32px' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Terminal size={14} style={{ color: '#FFB800' }} />
                        <span style={{ color: '#FFB800', fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em' }}>LEXIAI</span>
                    </div>
                    <a href="https://github.com/AdityaKrSingh26" style={{ color: '#3A3020', fontSize: '11px', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#8A7A60')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#3A3020')}
                    >
                        Contact
                    </a>
                    <p style={{ color: '#3A3020', fontSize: '11px' }}>© 2024 LexiAI.</p>
                </div>
            </footer>

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </div>
    );
};

export default LandingPage;
