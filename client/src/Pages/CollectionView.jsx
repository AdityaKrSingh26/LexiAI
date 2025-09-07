import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    FileText,
    Grid,
    List,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit3,
    Trash2,
    Share2,
    Download,
    Star,
    Clock,
    Tag,
    FolderPlus,
    Users,
    Settings,
    Folder
} from 'lucide-react';
import { getUser } from '../utils/auth';
import useDocumentStore from '../utils/documentStore';
import { DocumentGridSkeleton } from '../components/LoadingSkeleton';
import CreateCollectionModal from '../components/CreateCollectionModal';
import AddDocumentsModal from '../components/AddDocumentsModal';

const CollectionView = () => {
    const navigate = useNavigate();
    const { collectionId } = useParams();
    const [user, setUser] = useState(null);
    const [collection, setCollection] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);
    const [showAddDocumentsModal, setShowAddDocumentsModal] = useState(false);

    const {
        documents,
        collections,
        isLoading,
        loadingStates,
        getCollectionById,
        updateCollection,
        deleteCollection,
        addDocumentsToCollection,
        removeDocumentsFromCollection,
        shareCollection,
        toggleFavorite,
        deleteDocument
    } = useDocumentStore();

    useEffect(() => {
        const currentUser = getUser();
        if (currentUser) {
            setUser(currentUser);
            loadCollection();
        }
    }, [collectionId]);

    const loadCollection = async () => {
        try {
            const collectionData = await getCollectionById(collectionId);
            setCollection(collectionData);
        } catch (error) {
            console.error('Failed to load collection:', error);
            toast.error('Failed to load collection');
            navigate('/dashboard');
        }
    };

    const handleDocumentSelect = (documentId) => {
        setSelectedDocuments(prev => 
            prev.includes(documentId) 
                ? prev.filter(id => id !== documentId)
                : [...prev, documentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedDocuments.length === collection?.documents?.length) {
            setSelectedDocuments([]);
        } else {
            setSelectedDocuments(collection?.documents?.map(doc => doc._id) || []);
        }
    };

    const handleBulkRemove = async () => {
        if (selectedDocuments.length === 0) return;
        
        try {
            await removeDocumentsFromCollection(collectionId, selectedDocuments);
            toast.success(`Removed ${selectedDocuments.length} documents from collection`);
            setSelectedDocuments([]);
            loadCollection(); // Refresh collection data
        } catch (error) {
            toast.error('Failed to remove documents from collection');
        }
    };

    const handleDeleteCollection = async () => {
        if (!window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteCollection(collectionId);
            toast.success('Collection deleted successfully');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to delete collection');
        }
    };

    const handleShareCollection = async () => {
        const email = prompt('Enter email address to share with:');
        if (!email) return;

        try {
            await shareCollection(collectionId, email, 'read');
            toast.success('Collection shared successfully');
        } catch (error) {
            toast.error('Failed to share collection');
        }
    };

    const filteredDocuments = collection?.documents?.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

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

    if (!collection && !isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Collection not found</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        
                        {collection && (
                            <div className="flex items-center gap-3">
                                <div 
                                    className="p-3 rounded-lg"
                                    style={{ backgroundColor: collection.color + '20' }}
                                >
                                    <Folder 
                                        style={{ color: collection.color }} 
                                        size={24} 
                                    />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{collection.name}</h1>
                                    <p className="text-gray-400">
                                        {collection.documents?.length || 0} documents
                                        {collection.description && ` • ${collection.description}`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Add Documents Button */}
                        <button
                            onClick={() => setShowAddDocumentsModal(true)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus size={16} />
                            Add Documents
                        </button>

                        {/* Collection Actions */}
                        <div className="relative">
                            <button
                                onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <MoreVertical size={20} />
                            </button>
                            
                            {showCollectionMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(true);
                                            setShowCollectionMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Edit3 size={16} />
                                        Edit Collection
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleShareCollection();
                                            setShowCollectionMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
                                    >
                                        <Share2 size={16} />
                                        Share Collection
                                    </button>
                                    <hr className="border-gray-700" />
                                    <button
                                        onClick={() => {
                                            handleDeleteCollection();
                                            setShowCollectionMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-700 text-red-400 flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete Collection
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700' : 'hover:bg-gray-700'} transition-colors`}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700' : 'hover:bg-gray-700'} transition-colors`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search documents in this collection..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Filter size={16} />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedDocuments.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-blue-400">
                                {selectedDocuments.length} document(s) selected
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBulkRemove}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Remove from Collection
                                </button>
                                <button
                                    onClick={() => setSelectedDocuments([])}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Documents Grid/List */}
                {loadingStates?.documents || isLoading ? (
                    <DocumentGridSkeleton viewMode={viewMode} count={6} />
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {filteredDocuments.map((document) => (
                            <motion.div
                                key={document._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all cursor-pointer ${
                                    selectedDocuments.includes(document._id) ? 'ring-2 ring-blue-500' : ''
                                } ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}
                            >
                                <div className={`flex items-start gap-3 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedDocuments.includes(document._id)}
                                        onChange={() => handleDocumentSelect(document._id)}
                                        className="mt-1"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="text-blue-400" size={20} />
                                            <h3 
                                                className="font-semibold text-white truncate cursor-pointer hover:text-blue-400"
                                                onClick={() => navigate(`/chat?pdf=${document._id}`)}
                                            >
                                                {document.title}
                                            </h3>
                                            {document.isFavorite && <Star className="text-yellow-500" size={16} />}
                                        </div>
                                        
                                        <div className="text-sm text-gray-400 space-y-1">
                                            <div className="flex items-center gap-4">
                                                <span>{formatFileSize(document.fileSize || 0)}</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
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
                                                        <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                                                            +{document.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {viewMode === 'list' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(document._id);
                                            }}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <Star 
                                                size={16} 
                                                className={document.isFavorite ? 'text-yellow-500' : 'text-gray-400'} 
                                            />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(document.url, '_blank');
                                            }}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <Download size={16} className="text-gray-400" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !loadingStates?.documents && filteredDocuments.length === 0 && (
                    <div className="text-center py-12">
                        <FileText size={64} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No documents in this collection</h3>
                        <p className="text-gray-400 mb-6">
                            {searchQuery ? 'No documents match your search.' : 'Start by adding documents to this collection.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
                            >
                                Browse Documents
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Create/Edit Collection Modal */}
            <CreateCollectionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateCollection={async (data) => {
                    await updateCollection(collectionId, data);
                    loadCollection();
                    toast.success('Collection updated successfully');
                }}
                initialData={collection}
                isEditing={true}
            />

            {/* Add Documents Modal */}
            <AddDocumentsModal
                isOpen={showAddDocumentsModal}
                onClose={() => setShowAddDocumentsModal(false)}
                onAddDocuments={async (documentIds) => {
                    await addDocumentsToCollection(collectionId, documentIds);
                    loadCollection();
                    toast.success(`Added ${documentIds.length} documents to collection`);
                }}
                collectionId={collectionId}
            />
        </div>
    );
};

export default CollectionView;
