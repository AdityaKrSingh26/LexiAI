import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    FileText,
    Grid,
    List,
    Plus,
    Search,
    MoreVertical,
    Edit3,
    Trash2,
    Share2,
    Download,
    Star,
    Folder,
    X,
} from 'lucide-react';
import { getUser } from '../utils/auth';
import useDocumentStore from '../utils/documentStore';
import { DocumentGridSkeleton } from '../components/LoadingSkeleton';
import CreateCollectionModal from '../components/CreateCollectionModal';
import AddDocumentsModal from '../components/AddDocumentsModal';

const CollectionView = () => {
    const navigate = useNavigate();
    const { collectionId } = useParams();
    const [collection, setCollection] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCollectionMenu, setShowCollectionMenu] = useState(false);
    const [showAddDocumentsModal, setShowAddDocumentsModal] = useState(false);

    const {
        isLoading,
        loadingStates,
        getCollectionById,
        updateCollection,
        deleteCollection,
        addDocumentsToCollection,
        removeDocumentsFromCollection,
        shareCollection,
        toggleFavorite,
    } = useDocumentStore();

    useEffect(() => {
        getUser();
        loadCollection();
    }, [collectionId]);

    const loadCollection = async () => {
        try {
            const data = await getCollectionById(collectionId);
            setCollection(data);
        } catch {
            toast.error('Failed to load collection');
            navigate('/dashboard');
        }
    };

    const handleDocumentSelect = (id) => {
        setSelectedDocuments(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleBulkRemove = async () => {
        if (selectedDocuments.length === 0) return;
        try {
            await removeDocumentsFromCollection(collectionId, selectedDocuments);
            toast.success(`Removed ${selectedDocuments.length} documents`);
            setSelectedDocuments([]);
            loadCollection();
        } catch {
            toast.error('Failed to remove documents');
        }
    };

    const handleDeleteCollection = async () => {
        if (!window.confirm('Delete this collection? This cannot be undone.')) return;
        try {
            await deleteCollection(collectionId);
            toast.success('Collection deleted');
            navigate('/dashboard');
        } catch {
            toast.error('Failed to delete collection');
        }
    };

    const handleShareCollection = async () => {
        const email = prompt('Enter email address to share with:');
        if (!email) return;
        try {
            await shareCollection(collectionId, email, 'read');
            toast.success('Collection shared');
        } catch {
            toast.error('Failed to share');
        }
    };

    const filtered = collection?.documents?.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    if (!collection && !isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-white/70 mb-4">Collection not found</h2>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-5 py-2.5 bg-white text-[#0A0A0B] rounded-xl text-sm font-medium"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white">
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/3 w-96 h-96 bg-violet-500/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[128px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 text-white/30 hover:text-white/70 hover:bg-white/[0.05] rounded-xl transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        {collection && (
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{
                                        backgroundColor: (collection.color || '#8b5cf6') + '20',
                                        border: `1px solid ${collection.color || '#8b5cf6'}30`,
                                    }}
                                >
                                    <Folder size={18} style={{ color: collection.color || '#8b5cf6' }} />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-white/90">{collection.name}</h1>
                                    <p className="text-xs text-white/30">
                                        {collection.documents?.length || 0} documents
                                        {collection.description && ` · ${collection.description}`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddDocumentsModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-white/60 hover:text-white/80 rounded-xl text-sm transition-all"
                        >
                            <Plus size={14} />
                            Add Documents
                        </button>

                        {/* View toggle */}
                        <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 gap-0.5">
                            {[{ v: 'grid', I: Grid }, { v: 'list', I: List }].map(({ v, I }) => (
                                <button
                                    key={v}
                                    onClick={() => setViewMode(v)}
                                    className={`p-1.5 rounded-lg transition-all ${viewMode === v ? 'bg-white/[0.08] text-white/80' : 'text-white/25 hover:text-white/50'}`}
                                >
                                    <I size={15} />
                                </button>
                            ))}
                        </div>

                        {/* More menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                                className="p-2 text-white/30 hover:text-white/70 hover:bg-white/[0.05] rounded-xl transition-all"
                            >
                                <MoreVertical size={16} />
                            </button>
                            <AnimatePresence>
                                {showCollectionMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                        className="absolute right-0 mt-2 w-44 bg-[#0D0D0E] border border-white/[0.08] rounded-xl shadow-2xl z-20 overflow-hidden"
                                    >
                                        {[
                                            { icon: Edit3, label: 'Edit Collection', action: () => { setShowCreateModal(true); setShowCollectionMenu(false); } },
                                            { icon: Share2, label: 'Share', action: () => { handleShareCollection(); setShowCollectionMenu(false); } },
                                        ].map(({ icon: Icon, label, action }) => (
                                            <button key={label} onClick={action} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all">
                                                <Icon size={14} />
                                                {label}
                                            </button>
                                        ))}
                                        <div className="border-t border-white/[0.06]" />
                                        <button
                                            onClick={() => { handleDeleteCollection(); setShowCollectionMenu(false); }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.05] transition-all"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-5">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white/70 placeholder-white/20 focus:outline-none focus:border-violet-500/30 transition-all"
                        />
                    </div>
                </div>

                {/* Bulk actions */}
                <AnimatePresence>
                    {selectedDocuments.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-3 bg-violet-500/[0.06] border border-violet-500/20 rounded-xl flex items-center justify-between"
                        >
                            <span className="text-sm text-violet-400">{selectedDocuments.length} selected</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBulkRemove}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-xs transition-all"
                                >
                                    <Trash2 size={12} />
                                    Remove from Collection
                                </button>
                                <button
                                    onClick={() => setSelectedDocuments([])}
                                    className="p-1.5 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Document grid */}
                {loadingStates?.documents || isLoading ? (
                    <DocumentGridSkeleton viewMode={viewMode} count={6} />
                ) : (
                    <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {filtered.map((doc, i) => {
                            const isSelected = selectedDocuments.includes(doc._id);
                            return (
                                <motion.div
                                    key={doc._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className={`group relative bg-white/[0.02] hover:bg-white/[0.04] border transition-all rounded-2xl p-4 cursor-pointer ${
                                        isSelected
                                            ? 'border-violet-500/40 bg-violet-500/[0.04]'
                                            : 'border-white/[0.05] hover:border-violet-500/20'
                                    } ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
                                >
                                    <div className={`flex items-start gap-3 ${viewMode === 'list' ? 'flex-1' : 'mb-2'}`}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleDocumentSelect(doc._id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-0.5 accent-violet-500 flex-shrink-0"
                                        />
                                        <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                            <FileText size={14} className="text-violet-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-sm font-medium text-white/80 truncate hover:text-violet-400 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/chat?pdf=${doc._id}`)}
                                            >
                                                {doc.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-white/25">{formatFileSize(doc.fileSize || 0)}</span>
                                                <span className="text-white/15 text-xs">·</span>
                                                <span className="text-xs text-white/25">{formatDate(doc.uploadedAt)}</span>
                                                {doc.isFavorite && <Star size={10} className="text-yellow-400/60" />}
                                            </div>
                                            {doc.tags?.length > 0 && viewMode === 'grid' && (
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {doc.tags.slice(0, 2).map((tag, idx) => (
                                                        <span key={idx} className="px-1.5 py-0.5 bg-violet-500/10 text-violet-400/70 text-[10px] rounded-full border border-violet-500/15">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {viewMode === 'list' && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleFavorite(doc._id); }}
                                                className="p-1.5 text-white/20 hover:text-yellow-400 transition-colors rounded-lg hover:bg-white/[0.05]"
                                            >
                                                <Star size={14} />
                                            </button>
                                            {doc.url && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); window.open(doc.url, '_blank'); }}
                                                    className="p-1.5 text-white/20 hover:text-white/60 transition-colors rounded-lg hover:bg-white/[0.05]"
                                                >
                                                    <Download size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !loadingStates?.documents && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
                            <FileText size={22} className="text-white/20" />
                        </div>
                        <h3 className="text-sm font-semibold text-white/50 mb-2">
                            {searchQuery ? 'No documents match your search' : 'No documents in this collection'}
                        </h3>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowAddDocumentsModal(true)}
                                className="mt-4 px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-white/50 rounded-xl text-sm transition-all"
                            >
                                Add Documents
                            </button>
                        )}
                    </div>
                )}
            </div>

            <CreateCollectionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateCollection={async (data) => {
                    await updateCollection(collectionId, data);
                    loadCollection();
                    toast.success('Collection updated');
                }}
                initialData={collection}
                isEditing={true}
            />

            <AddDocumentsModal
                isOpen={showAddDocumentsModal}
                onClose={() => setShowAddDocumentsModal(false)}
                onAddDocuments={async (ids) => {
                    await addDocumentsToCollection(collectionId, ids);
                    loadCollection();
                    toast.success(`Added ${ids.length} documents`);
                }}
                collectionId={collectionId}
            />
        </div>
    );
};

export default CollectionView;
