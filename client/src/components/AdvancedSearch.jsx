import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Search,
    Filter,
    Calendar,
    Tag,
    Folder,
    Star,
    FileText,
    SortAsc,
    SortDesc,
    RotateCcw
} from 'lucide-react';
import useDocumentStore from '../utils/documentStore';

const AdvancedSearch = ({ isOpen, onClose, onSearch }) => {
    const [filters, setFilters] = useState({
        query: '',
        tags: [],
        collections: [],
        dateFrom: '',
        dateTo: '',
        fileSize: '',
        sortBy: 'uploadedAt',
        sortOrder: 'desc',
        favorites: false,
        shared: false
    });

    const { collections, getPopularTags } = useDocumentStore();
    const [availableTags, setAvailableTags] = useState([]);

    useEffect(() => {
        setAvailableTags(getPopularTags());
    }, []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleTagToggle = (tag) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    const handleCollectionToggle = (collectionId) => {
        setFilters(prev => ({
            ...prev,
            collections: prev.collections.includes(collectionId)
                ? prev.collections.filter(c => c !== collectionId)
                : [...prev.collections, collectionId]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(filters);
        onClose();
    };

    const resetFilters = () => {
        setFilters({
            query: '',
            tags: [],
            collections: [],
            dateFrom: '',
            dateTo: '',
            fileSize: '',
            sortBy: 'uploadedAt',
            sortOrder: 'desc',
            favorites: false,
            shared: false
        });
    };

    const fileSizeOptions = [
        { value: '', label: 'Any size' },
        { value: '0-1', label: 'Less than 1 MB' },
        { value: '1-5', label: '1 - 5 MB' },
        { value: '5-10', label: '5 - 10 MB' },
        { value: '10-50', label: '10 - 50 MB' },
        { value: '50-100', label: '50 - 100 MB' },
        { value: '100-1000', label: 'More than 100 MB' }
    ];

    const sortOptions = [
        { value: 'uploadedAt', label: 'Upload Date' },
        { value: 'title', label: 'Title' },
        { value: 'fileSize', label: 'File Size' },
        { value: 'accessCount', label: 'Access Count' },
        { value: 'lastAccessedAt', label: 'Last Accessed' }
    ];

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
                        className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Filter size={24} />
                                Advanced Search
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Search Query */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Search Text
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={filters.query}
                                        onChange={(e) => handleFilterChange('query', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                        placeholder="Search in title, content, or metadata..."
                                    />
                                </div>
                            </div>

                            {/* Quick Filters */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Quick Filters
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange('favorites', !filters.favorites)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                            filters.favorites 
                                                ? 'bg-yellow-600/20 border-yellow-600 text-yellow-400' 
                                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        <Star size={16} />
                                        Favorites
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange('shared', !filters.shared)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                            filters.shared 
                                                ? 'bg-green-600/20 border-green-600 text-green-400' 
                                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        <FileText size={16} />
                                        Shared with me
                                    </button>
                                </div>
                            </div>

                            {/* Tags Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map(({ tag, count }) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleTagToggle(tag)}
                                            className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-sm transition-colors ${
                                                filters.tags.includes(tag)
                                                    ? 'bg-blue-600/20 border-blue-600 text-blue-400'
                                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            <Tag size={14} />
                                            {tag} ({count})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Collections Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Collections
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {collections.map((collection) => (
                                        <button
                                            key={collection._id}
                                            type="button"
                                            onClick={() => handleCollectionToggle(collection._id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                                                filters.collections.includes(collection._id)
                                                    ? 'bg-purple-600/20 border-purple-600 text-purple-400'
                                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            <Folder 
                                                size={16} 
                                                style={{ color: collection.color }} 
                                            />
                                            {collection.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    />
                                </div>
                            </div>

                            {/* File Size */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    File Size
                                </label>
                                <select
                                    value={filters.fileSize}
                                    onChange={(e) => handleFilterChange('fileSize', e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                >
                                    {fileSizeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    >
                                        {sortOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Sort Order
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleFilterChange('sortOrder', 'asc')}
                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                                filters.sortOrder === 'asc'
                                                    ? 'bg-blue-600/20 border-blue-600 text-blue-400'
                                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            <SortAsc size={16} />
                                            Asc
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleFilterChange('sortOrder', 'desc')}
                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                                filters.sortOrder === 'desc'
                                                    ? 'bg-blue-600/20 border-blue-600 text-blue-400'
                                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            <SortDesc size={16} />
                                            Desc
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <RotateCcw size={16} />
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2 px-4 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AdvancedSearch;
