import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Mail, Lock, User, ArrowRight } from 'lucide-react';
import api from '../utils/api.js';

const MONO = { fontFamily: "'JetBrains Mono', 'Courier New', monospace" };

const AuthPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', username: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const { data } = await api.post(endpoint, {
                email: formData.email,
                password: formData.password,
                username: formData.username,
            });
            if (!data.token || !data.user) throw new Error('Invalid server response');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div
            style={{ ...MONO, background: '#080705', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative', overflow: 'hidden' }}
        >
            {/* Grid bg */}
            <div
                style={{
                    position: 'fixed', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(#1A1508 1px, transparent 1px), linear-gradient(90deg, #1A1508 1px, transparent 1px)',
                    backgroundSize: '48px 48px', opacity: 0.5,
                }}
            />

            <div style={{ width: '100%', maxWidth: '360px', position: 'relative', zIndex: 10 }}>
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '32px' }}
                >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Terminal size={18} style={{ color: '#FFB800' }} />
                        <span style={{ color: '#FFB800', fontSize: '16px', fontWeight: 700, letterSpacing: '0.2em' }}>LEXIAI</span>
                    </div>
                    <p style={{ color: '#5A4A30', fontSize: '11px', letterSpacing: '0.1em' }}>
                        {isLogin ? 'SIGN IN TO CONTINUE' : 'CREATE YOUR ACCOUNT'}
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ border: '1px solid #2A2010', background: '#0C0A06', padding: '24px' }}
                >
                    {/* Tabs */}
                    <div style={{ display: 'flex', marginBottom: '24px', border: '1px solid #2A2010' }}>
                        {['SIGN IN', 'SIGN UP'].map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => { setIsLogin(i === 0); setError(''); }}
                                style={{
                                    ...MONO,
                                    flex: 1,
                                    padding: '8px',
                                    background: (i === 0) === isLogin ? '#FFB800' : 'transparent',
                                    color: (i === 0) === isLogin ? '#080705' : '#5A4A30',
                                    border: 'none',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ marginBottom: '16px', padding: '10px 12px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#f87171', fontSize: '11px' }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ position: 'relative' }}
                                >
                                    <User size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5A4A30' }} />
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        style={{
                                            ...MONO,
                                            width: '100%',
                                            paddingLeft: '32px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
                                            background: '#080705',
                                            border: '1px solid #2A2010',
                                            color: '#F0E6CC',
                                            fontSize: '12px',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            transition: 'border-color 0.15s',
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = '#FFB800')}
                                        onBlur={(e) => (e.target.style.borderColor = '#2A2010')}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {[
                            { type: 'email', name: 'email', placeholder: 'email address', Icon: Mail },
                            { type: 'password', name: 'password', placeholder: 'password', Icon: Lock },
                        ].map(({ type, name, placeholder, Icon }) => (
                            <div key={name} style={{ position: 'relative' }}>
                                <Icon size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5A4A30' }} />
                                <input
                                    type={type}
                                    name={name}
                                    placeholder={placeholder}
                                    value={formData[name]}
                                    onChange={handleInputChange}
                                    style={{
                                        ...MONO,
                                        width: '100%',
                                        paddingLeft: '32px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px',
                                        background: '#080705',
                                        border: '1px solid #2A2010',
                                        color: '#F0E6CC',
                                        fontSize: '12px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = '#FFB800')}
                                    onBlur={(e) => (e.target.style.borderColor = '#2A2010')}
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                ...MONO,
                                marginTop: '8px',
                                padding: '12px',
                                background: isLoading ? '#8A7A00' : '#FFB800',
                                color: '#080705',
                                border: 'none',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.15em',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#FFC933'; }}
                            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#FFB800'; }}
                        >
                            {isLoading ? (
                                <span style={{ width: '14px', height: '14px', border: '2px solid rgba(8,7,5,0.3)', borderTop: '2px solid #080705', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                            ) : (
                                <>
                                    <span>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
                                    <ArrowRight size={13} />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                <p style={{ textAlign: 'center', marginTop: '20px', color: '#3A3020', fontSize: '11px' }}>
                    <span
                        style={{ cursor: 'pointer', transition: 'color 0.15s' }}
                        onClick={() => navigate('/')}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#8A7A60')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#3A3020')}
                    >
                        ← back to home
                    </span>
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default AuthPage;
