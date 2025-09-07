import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    FileText,
    Folder,
    Search,
    Filter,
    Grid,
    List,
    Star,
    Calendar,
    BarChart3,
    Plus,
    Upload,
    Trash2,
    Download,
    Tag,
    FolderPlus,
    Settings,
    MoreVertical,
    Clock,
    TrendingUp,
    Users,
    HardDrive
} from 'lucide-react';
import { getUser } from '../utils/auth';
import useDocumentStore from '../utils/documentStore';
import useChatStore from '../utils/chatStore';
import { DocumentGridSkeleton, AnalyticsCardsSkeleton } from '../components/LoadingSkeleton';
import CreateCollectionModal from '../components/CreateCollectionModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPath, setCurrentPath] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createType, setCreateType] = useState('collection'); // 'collection' or 'upload'

    const {
        documents,
        collections,
        analytics,
        isLoading,
        loadingStates,
        fetchDocuments,
        fetchCollections,
        fetchAnalytics,
        searchDocuments,
        createCollection,
        toggleFavorite,
        deleteDocument,
        shareDocument
    } = useDocumentStore();

    const { setCurrentPdf, clearChat } = useChatStore();

    useEffect(() => {
        const currentUser = getUser();
        if (currentUser) {
            setUser(currentUser);
            // Stagger API calls to prevent rate limiting
            fetchDocuments();
            setTimeout(() => fetchCollections(), 100);
            setTimeout(() => fetchAnalytics(), 200);
        }
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim()) {
            searchDocuments(query);
        } else {
            fetchDocuments();
        }
    };

    const handleUploadDocument = () => {
        // Clear current PDF and messages to start fresh
        setCurrentPdf(null);
        clearChat();
        // Navigate to chat page for new upload with auto-upload parameter
        navigate('/chat');
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
        
        // Show appropriate decimal places
        const formattedSize = size % 1 === 0 ? size.toFixed(0) : size.toFixed(1);
        return `${formattedSize} ${sizes[i]}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Analytics Cards Component
    const AnalyticsCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Total Documents</p>
                        <p className="text-2xl font-bold text-white">{analytics?.overview?.totalDocuments || 0}</p>
                    </div>
                    <FileText className="text-blue-500" size={24} />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 rounded-lg p-6"
            >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-gray-400 text-sm">Storage Used</p>
                        <p className="text-2xl font-bold text-white">
                            {formatFileSize(analytics?.overview?.totalFileSize || 0)}
                        </p>
                        {analytics?.overview?.totalDocuments > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Avg: {formatFileSize(analytics?.overview?.avgFileSize || 0)} per document
                            </p>
                        )}
                    </div>
                    <HardDrive className="text-green-500" size={24} />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-lg p-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Favorites</p>
                        <p className="text-2xl font-bold text-white">{analytics?.overview?.favoriteCount || 0}</p>
                    </div>
                    <Star className="text-yellow-500" size={24} />
                </div>
            </motion.div>
        </div>
    );

    // Toolbar Component
    const Toolbar = () => (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <Filter size={20} />
                </button>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
                <div className="flex bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'hover:bg-gray-700'} transition-colors`}
                    >
                        <Grid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-700'} transition-colors`}
                    >
                        <List size={16} />
                    </button>
                </div>

                <button
                    onClick={() => {
                        setCreateType('collection');
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                    <FolderPlus size={16} />
                    New Collection
                </button>

                <button
                    onClick={handleUploadDocument}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                    <Upload size={16} />
                    Upload Document
                </button>
            </div>
        </div>
    );

    // Document Grid Component
    const DocumentGrid = () => (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {/* Collections */}
            {collections.map((collection) => (
                <motion.div
                    key={collection._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer ${
                        viewMode === 'list' ? 'flex items-center justify-between' : ''
                    }`}
                    onClick={() => navigate(`/dashboard/collection/${collection._id}`)}
                >
                    <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: collection.color + '20' }}>
                            <Folder style={{ color: collection.color }} size={24} />
                        </div>
                        <div className={viewMode === 'list' ? 'flex-1' : ''}>
                            <h3 className="font-semibold text-white truncate">{collection.name}</h3>
                            <p className="text-gray-400 text-sm">{collection.documentCount} documents</p>
                        </div>
                    </div>
                    {viewMode === 'list' && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">{formatDate(collection.createdAt)}</span>
                        </div>
                    )}
                </motion.div>
            ))}

            {/* Documents */}
            {documents.map((doc) => (
                <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer group relative ${
                        viewMode === 'list' ? 'flex items-center justify-between' : ''
                    }`}
                    onClick={() => navigate(`/chat?doc=${doc._id}`)}
                >
                    <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'flex-1' : 'w-full'}`}>
                        
                        {/* Action buttons for grid view */}
                        {viewMode === 'grid' && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(doc._id);
                                    }}
                                    className="p-1 hover:bg-gray-700 rounded text-yellow-400"
                                    title="Toggle favorite"
                                >
                                    <Star size={14} />
                                </button>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Are you sure you want to delete "${doc.title}"? This will also delete all associated chats. This action cannot be undone.`)) {
                                            const deletingToast = toast.loading(`Deleting "${doc.title}"...`, {
                                                icon: '🗑️',
                                            });
                                            
                                            try {
                                                await deleteDocument(doc._id);
                                                toast.dismiss(deletingToast);
                                                toast.success(`"${doc.title}" has been successfully deleted.`, {
                                                    duration: 4000,
                                                    icon: '✅',
                                                });
                                            } catch (error) {
                                                toast.dismiss(deletingToast);
                                                toast.error('Failed to delete the document. Please try again.', {
                                                    duration: 5000,
                                                    icon: '❌',
                                                });
                                            }
                                        }
                                    }}
                                    className="p-1 hover:bg-gray-700 rounded text-red-400"
                                    title="Delete document and all chats"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}

                        <div className="p-3 bg-red-500/20 rounded-lg flex-shrink-0">
                            <FileText className="text-red-500" size={24} />
                        </div>
                        <div className={`${viewMode === 'list' ? 'flex-1' : 'flex-1 min-w-0'}`}>
                            <h3 className="font-semibold text-white truncate" title={doc.title}>{doc.title}</h3>
                            <p className="text-gray-400 text-sm">{formatFileSize(doc.fileSize)}</p>
                            {doc.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {doc.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {doc.isFavorite && <Star className="text-yellow-500" size={16} />}
                        <span className="text-gray-400 text-sm">{formatDate(doc.uploadedAt)}</span>
                        {viewMode === 'list' && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(doc._id);
                                    }}
                                    className="p-1 hover:bg-gray-700 rounded"
                                >
                                    <Star size={16} />
                                </button>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Are you sure you want to delete "${doc.title}"? This will also delete all associated chats. This action cannot be undone.`)) {
                                            const deletingToast = toast.loading(`Deleting "${doc.title}"...`, {
                                                icon: '🗑️',
                                            });
                                            
                                            try {
                                                await deleteDocument(doc._id);
                                                toast.dismiss(deletingToast);
                                                toast.success(`"${doc.title}" has been successfully deleted.`, {
                                                    duration: 4000,
                                                    icon: '✅',
                                                });
                                            } catch (error) {
                                                toast.dismiss(deletingToast);
                                                toast.error('Failed to delete the document. Please try again.', {
                                                    duration: 5000,
                                                    icon: '❌',
                                                });
                                            }
                                        }
                                    }}
                                    className="p-1 hover:bg-gray-700 rounded text-red-400"
                                    title="Delete document and all chats"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Document Management</h1>
                        <p className="text-gray-400">Organize and manage your documents</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Welcome, {user?.username}</span>
                        <button
                            onClick={() => navigate('/chat')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Go to Chat
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-6 py-8">
                {/* Analytics */}
                {loadingStates?.analytics ? (
                    <AnalyticsCardsSkeleton />
                ) : (
                    <AnalyticsCards />
                )}

                {/* Toolbar */}
                <Toolbar />

                {/* Content */}
                {loadingStates?.documents || loadingStates?.collections ? (
                    <DocumentGridSkeleton viewMode={viewMode} count={8} />
                ) : (
                    <DocumentGrid />
                )}

                {/* Empty State */}
                {!isLoading && !loadingStates?.documents && !loadingStates?.collections && documents.length === 0 && collections.length === 0 && (
                    <div className="text-center py-12">
                        <FileText size={64} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
                        <p className="text-gray-400 mb-6">Start by uploading your first document or creating a collection</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleUploadDocument}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
                            >
                                Upload Document
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
                            >
                                Create Collection
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Collection Modal */}
            <CreateCollectionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateCollection={async (data) => {
                    await createCollection(data);
                    toast.success('Collection created successfully');
                }}
            />
        </div>
    );
};

export default Dashboard;
