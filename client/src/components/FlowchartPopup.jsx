import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FlowchartPopup = ({ isOpen, onClose, flowchartImage }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-50"
                        onClick={onClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl bg-gray-800 rounded-lg p-6 shadow-xl z-50"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">PDF Document Structure</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="bg-gray-700 rounded-lg p-2 overflow-auto max-h-[70vh]">
                            {flowchartImage ? (
                                <img
                                    src={flowchartImage}
                                    alt="PDF Document Flowchart"
                                    className="w-full object-contain"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-400">
                                    No flowchart available
                                </div>
                            )}
                        </div>

                        <div className="mt-4 text-sm text-gray-400">
                            This flowchart visualizes the structure of your PDF document
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FlowchartPopup;