import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Search,
    FileText,
    Plus,
    Check,
    Star,
    Calendar,
    Tag
} from 'lucide-react';
import useDocumentStore from '../utils/documentStore';

const AddDocumentsModal = ({ isOpen, onClose, onAddDocuments, collectionId }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const { documents, fetchDocuments } = useDocumentStore();

    useEffect(() => {
        if (isOpen) {
            fetchDocuments();
            setSelectedDocuments([]);
            setSearchQuery('');
        }
    }, [isOpen]);

    // Filter documents that are not already in the collection
    const availableDocuments = documents.filter(doc => 
        !doc.collections?.includes(collectionId) &&
        (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    const handleDocumentToggle = (documentId) => {
        setSelectedDocuments(prev => 
            prev.includes(documentId) 
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedDocuments.length === availableDocuments.length) {
            setSelectedDocuments([]);
        } else {
            setSelectedDocuments(availableDocuments.map(doc => doc._id));
        }
    };

    const handleSubmit = async () => {
        if (selectedDocuments.length === 0) return;
        
        setIsLoading(true);
        try {
            await onAddDocuments(selectedDocuments);
            onClose();
        } catch (error) {
            console.error('Error adding documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Add Documents to Collection</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                />
                            </div>
                        </div>

                        {/* Selection Controls */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleSelectAll}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                >
                                    {selectedDocuments.length === availableDocuments.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <span className="text-gray-400 text-sm">
                                    {selectedDocuments.length} of {availableDocuments.length} selected
                                </span>
                            </div>
                            {availableDocuments.length === 0 && (
                                <span className="text-gray-400 text-sm">
                                    All documents are already in this collection
                                </span>
                            )}
                        </div>

                        {/* Documents List */}
                        <div className="flex-1 overflow-y-auto mb-6">
                            {availableDocuments.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No documents available</h3>
                                    <p className="text-gray-400">
                                        {searchQuery 
                                            ? 'No documents match your search criteria.' 
                                            : 'All your documents are already in this collection.'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {availableDocuments.map((document) => (
                                        <motion.div
                                            key={document._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-lg border transition-all cursor-pointer ${
                                                selectedDocuments.includes(document._id)
                                                    ? 'bg-blue-600/20 border-blue-600 ring-1 ring-blue-600'
                                                    : 'bg-gray-700 border-gray-600 hover:bg-gray-650'
                                            }`}
                                            onClick={() => handleDocumentToggle(document._id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                    selectedDocuments.includes(document._id)
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'border-gray-400'
                                                }`}>
                                                    {selectedDocuments.includes(document._id) && (
                                                        <Check size={14} className="text-white" />
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <FileText className="text-blue-400" size={18} />
                                                        <h3 className="font-semibold text-white truncate">
                                                            {document.title}
                                                        </h3>
                                                        {document.isFavorite && (
                                                            <Star className="text-yellow-500" size={16} />
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span>{formatFileSize(document.fileSize || 0)}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {formatDate(document.uploadedAt)}
                                                        </span>
                                                    </div>
                                                    
                                                    {document.tags && document.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {document.tags.slice(0, 3).map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {document.tags.length > 3 && (
                                                                <span className="px-2 py-1 bg-gray-600 text-gray-400 text-xs rounded">
                                                                    +{document.tags.length - 3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={selectedDocuments.length === 0 || isLoading}
                                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Add {selectedDocuments.length} Document{selectedDocuments.length !== 1 ? 's' : ''}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddDocumentsModal;
