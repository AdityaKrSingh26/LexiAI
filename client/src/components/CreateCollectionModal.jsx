import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Folder, 
    Tag, 
    Palette, 
    Users, 
    Globe, 
    Lock,
    Plus
} from 'lucide-react';

const CreateCollectionModal = ({ 
    isOpen, 
    onClose, 
    onCreateCollection, 
    initialData = null, 
    isEditing = false 
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'Folder',
        isPublic: false,
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (isEditing && initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                color: initialData.color || '#3B82F6',
                icon: initialData.icon || 'Folder',
                isPublic: initialData.isPublic || false,
                tags: initialData.tags || []
            });
        } else if (!isEditing) {
            setFormData({
                name: '',
                description: '',
                color: '#3B82F6',
                icon: 'Folder',
                isPublic: false,
                tags: []
            });
        }
    }, [isEditing, initialData, isOpen]);

    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
        '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsLoading(true);
        try {
            await onCreateCollection(formData);
            if (!isEditing) {
                setFormData({
                    name: '',
                    description: '',
                    color: '#3B82F6',
                    icon: 'Folder',
                    isPublic: false,
                    tags: []
                });
                setTagInput('');
            }
            onClose();
        } catch (error) {
            console.error(`Error ${isEditing ? 'updating' : 'creating'} collection:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
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
                        className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {isEditing ? 'Edit Collection' : 'Create Collection'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Collection Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    placeholder="Enter collection name"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white resize-none"
                                    rows="3"
                                    placeholder="Optional description"
                                />
                            </div>

                            {/* Color Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Color
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, color }))}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                                                formData.color === color ? 'border-white scale-110' : 'border-gray-600'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tags
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                                        placeholder="Add tag"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {formData.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-blue-200"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Privacy Settings */}
                            <div>
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-300">Make collection public</span>
                                    {formData.isPublic ? (
                                        <Globe size={16} className="text-green-500" />
                                    ) : (
                                        <Lock size={16} className="text-gray-500" />
                                    )}
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2 px-4 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!formData.name.trim() || isLoading}
                                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    {isLoading 
                                        ? (isEditing ? 'Updating...' : 'Creating...') 
                                        : (isEditing ? 'Update Collection' : 'Create Collection')
                                    }
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreateCollectionModal;
