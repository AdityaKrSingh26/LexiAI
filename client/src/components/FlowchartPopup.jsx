import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mermaid from "mermaid";

const mermaidCode = `graph TD
  A[Client] -->|Request| B(Gateway)
  B --> C[Server]
  C -->|Response| B
  B --> D[Database]`;

const FlowchartPopup = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const chartContainerRef = useRef(null);

    // Add refresh functionality
    const renderMermaidDiagram = useCallback(async () => {
        if (!chartContainerRef.current || !isOpen) return;

        setIsLoading(true);

        try {
            // Clear previous content
            chartContainerRef.current.innerHTML = '';

            // Create a unique ID for this render
            const uniqueId = `mermaid-${Date.now()}`;

            // Instead of adding the mermaid code as text content,
            // we need to create a pre element with the code
            const chartDiv = document.createElement('div');
            chartDiv.id = uniqueId;
            chartDiv.className = 'flex justify-center w-full';

            // Create a pre element with the mermaid code
            const preElement = document.createElement('pre');
            preElement.className = 'mermaid';
            preElement.textContent = mermaidCode;

            // Append the pre element to the container
            chartDiv.appendChild(preElement);
            chartContainerRef.current.appendChild(chartDiv);

            // Initialize mermaid
            await mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                securityLevel: 'loose',
                fontFamily: 'monospace',
            });

            // Run mermaid parsing and rendering
            await mermaid.run();

        } catch (error) {
            console.error('Failed to render mermaid diagram:', error);
            if (chartContainerRef.current) {
                chartContainerRef.current.innerHTML = `
                    <div class="text-red-500 text-center p-4">
                        Failed to render flowchart. 
                        <button class="ml-2 underline" onclick="window.reloadMermaid()">Try again</button>
                    </div>
                `;
            }
        } finally {
            setIsLoading(false);
        }
    }, [isOpen]);

    // Add refresh method to window for the error handler
    useEffect(() => {
        if (isOpen) {
            window.reloadMermaid = renderMermaidDiagram;
        }

        return () => {
            window.reloadMermaid = null;
        };
    }, [isOpen, renderMermaidDiagram]);

    // Render the diagram when popup opens
    useEffect(() => {
        if (isOpen) {
            // Small timeout to ensure DOM is ready
            const timer = setTimeout(() => {
                renderMermaidDiagram();
            }, 300); // Increased timeout to ensure DOM is fully ready

            return () => clearTimeout(timer);
        }
    }, [isOpen, renderMermaidDiagram]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-50"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl bg-gray-800 rounded-lg p-6 shadow-xl z-50"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">PDF Document Structure</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={renderMermaidDiagram}
                                    className="text-gray-400 hover:text-white transition-colors"
                                    title="Refresh diagram"
                                >
                                    <RefreshCw size={20} />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-4 overflow-auto max-h-[70vh]">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin">
                                        <RefreshCw size={24} className="text-gray-400" />
                                    </div>
                                </div>
                            ) : (
                                <div className="min-h-[300px] w-full" ref={chartContainerRef}></div>
                            )}
                        </div>

                        <div className="mt-4 text-sm text-gray-400">
                            This flowchart visualizes the structure of your PDF document using Mermaid
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FlowchartPopup;