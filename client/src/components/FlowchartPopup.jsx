import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, RefreshCw, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

let mermaidModule = null;
const getMermaid = async () => {
    if (!mermaidModule) mermaidModule = (await import('mermaid')).default;
    return mermaidModule;
};

const FALLBACK_CODE = `flowchart TD\n  A["Document"] --> B["Generate flowchart first"]`;

const FlowchartPopup = ({ isOpen, onClose, mermaidCode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [showRaw, setShowRaw] = useState(false);
    const chartContainerRef = useRef(null);
    const code = mermaidCode?.trim() || FALLBACK_CODE;

    const renderMermaidDiagram = useCallback(async () => {
        if (!chartContainerRef.current || !isOpen) return;
        setIsLoading(true);
        try {
            chartContainerRef.current.innerHTML = '';
            const cleanCode = code.replace(/^```(?:mermaid)?\s*/i, '').replace(/\s*```$/, '').trim();
            const uniqueId = `mermaid-${Date.now()}`;
            const chartDiv = document.createElement('div');
            chartDiv.id = uniqueId;
            chartDiv.className = 'flex justify-center w-full';
            const preElement = document.createElement('pre');
            preElement.className = 'mermaid';
            preElement.textContent = cleanCode;
            chartDiv.appendChild(preElement);
            chartContainerRef.current.appendChild(chartDiv);
            const mermaid = await getMermaid();
            await mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose', fontFamily: 'monospace' });
            await mermaid.run();
        } catch (error) {
            console.error('Mermaid render failed:', error);
            if (chartContainerRef.current) {
                chartContainerRef.current.innerHTML = `
                    <div class="text-red-400/70 text-center p-6 text-sm">
                        Failed to render flowchart.
                        <button class="ml-2 underline text-violet-400 hover:text-violet-300" onclick="window.reloadMermaid()">Try again</button>
                    </div>
                `;
            }
        } finally {
            setIsLoading(false);
        }
    }, [isOpen, code]);

    useEffect(() => {
        if (isOpen) { window.reloadMermaid = renderMermaidDiagram; }
        return () => { window.reloadMermaid = null; };
    }, [isOpen, renderMermaidDiagram]);

    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => renderMermaidDiagram(), 300);
            return () => clearTimeout(t);
        }
    }, [isOpen, renderMermaidDiagram, mermaidCode]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl bg-[#0D0D0E] border border-white/[0.07] rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                            <h2 className="text-sm font-semibold text-white/80">Document Structure</h2>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowRaw(v => !v)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                                        showRaw
                                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                            : 'text-white/30 hover:text-white/60 hover:bg-white/[0.05] border border-transparent'
                                    }`}
                                >
                                    <Code size={12} />
                                    {showRaw ? 'Hide Code' : 'View Code'}
                                </button>
                                <button
                                    onClick={renderMermaidDiagram}
                                    className="p-2 text-white/25 hover:text-white/60 hover:bg-white/[0.05] rounded-lg transition-all"
                                    title="Re-render"
                                >
                                    <RefreshCw size={14} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-white/25 hover:text-white/60 hover:bg-white/[0.05] rounded-lg transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            {showRaw ? (
                                <div className="bg-black/40 border border-white/[0.06] rounded-xl p-4 overflow-auto max-h-[65vh]">
                                    <pre className="text-cyan-400/70 text-sm font-mono whitespace-pre-wrap">{code}</pre>
                                </div>
                            ) : (
                                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 overflow-auto max-h-[65vh]">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-64">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <RefreshCw size={20} className="text-violet-400/50" />
                                            </motion.div>
                                        </div>
                                    ) : (
                                        <div className="min-h-[300px] w-full" ref={chartContainerRef} />
                                    )}
                                </div>
                            )}
                            <p className="mt-3 text-[10px] text-white/15">
                                AI-generated Mermaid diagram from document structure
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FlowchartPopup;
