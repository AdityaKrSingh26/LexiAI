import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    FileText,
    Folder,
    Search,
    Grid,
    List,
    Star,
    Upload,
    Trash2,
    FolderPlus,
    HardDrive,
    MessageSquare,
    Terminal,
} from 'lucide-react';
import { getUser } from '../utils/auth';
import useDocumentStore from '../utils/documentStore';
import useChatStore from '../utils/chatStore';
import { DocumentGridSkeleton, AnalyticsCardsSkeleton } from '../components/LoadingSkeleton';
import CreateCollectionModal from '../components/CreateCollectionModal';

const MONO = { fontFamily: "'JetBrains Mono', 'Courier New', monospace" };

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const {
        documents,
        collections,
        analytics,
        loadingStates,
        fetchDocuments,
        fetchCollections,
        fetchAnalytics,
        searchDocuments,
        createCollection,
        toggleFavorite,
        deleteDocument,
    } = useDocumentStore();

    const { setCurrentPdf, clearChat } = useChatStore();

    useEffect(() => {
        const currentUser = getUser();
        if (currentUser) {
            setUser(currentUser);
            fetchDocuments();
            setTimeout(() => fetchCollections(), 100);
            setTimeout(() => fetchAnalytics(), 200);
        }
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim()) searchDocuments(query);
        else fetchDocuments();
    };

    const handleUploadDocument = () => {
        setCurrentPdf(null);
        clearChat();
        navigate('/chat');
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const stats = [
        { label: 'Documents', value: analytics?.overview?.totalDocuments ?? 0, sub: null },
        {
            label: 'Storage',
            value: formatFileSize(analytics?.overview?.totalFileSize || 0),
            sub: analytics?.overview?.totalDocuments > 0
                ? `avg ${formatFileSize(analytics?.overview?.avgFileSize || 0)}`
                : null,
        },
        { label: 'Favorites', value: analytics?.overview?.favoriteCount ?? 0, sub: null },
    ];

    return (
        <div style={{ ...MONO, background: '#080705', color: '#F0E6CC', minHeight: '100vh' }}>
            {/* Grid background */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(#1A1508 1px, transparent 1px), linear-gradient(90deg, #1A1508 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                    opacity: 0.5,
                }}
            />

            {/* Header */}
            <header
                className="relative z-10 px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid #2A2010' }}
            >
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} style={{ color: '#FFB800' }} />
                        <span style={{ color: '#FFB800', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em' }}>
                            LEXIAI
                        </span>
                        <span style={{ color: '#3A3020', fontSize: '13px' }}>/</span>
                        <span style={{ color: '#8A7A60', fontSize: '11px', letterSpacing: '0.15em' }}>DASHBOARD</span>
                    </div>
                    {user && (
                        <span style={{ color: '#3A3020', fontSize: '11px' }}>[{user.username}]</span>
                    )}
                </div>
                <button
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-2 transition-colors"
                    style={{
                        background: '#FFB800',
                        color: '#080705',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        padding: '8px 16px',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FFC933')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFB800')}
                >
                    <MessageSquare size={13} />
                    OPEN CHAT
                </button>
            </header>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

                {/* Stats band */}
                {loadingStates?.analytics ? (
                    <div style={{ border: '1px solid #2A2010', height: '88px', marginBottom: '32px', background: '#0C0A06' }} />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ border: '1px solid #2A2010', marginBottom: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}
                    >
                        {stats.map((s, i) => (
                            <div
                                key={s.label}
                                style={{
                                    padding: '20px 24px',
                                    borderRight: i < 2 ? '1px solid #2A2010' : 'none',
                                }}
                            >
                                <p style={{ color: '#5A4A30', fontSize: '10px', letterSpacing: '0.25em', marginBottom: '8px' }}>
                                    {s.label.toUpperCase()}
                                </p>
                                <p style={{ color: '#FFB800', fontSize: '28px', fontWeight: 700, lineHeight: 1 }}>
                                    {s.value}
                                </p>
                                {s.sub && (
                                    <p style={{ color: '#5A4A30', fontSize: '10px', marginTop: '4px' }}>{s.sub}</p>
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Toolbar */}
                <div
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5"
                    style={{ borderBottom: '1px solid #2A2010' }}
                >
                    <div className="flex items-center gap-4 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 max-w-xs">
                            <Search
                                className="absolute"
                                size={12}
                                style={{ left: 0, top: '50%', transform: 'translateY(-50%)', color: '#5A4A30' }}
                            />
                            <input
                                type="text"
                                placeholder="search documents..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{
                                    ...MONO,
                                    width: '100%',
                                    paddingLeft: '20px',
                                    paddingRight: '8px',
                                    paddingTop: '6px',
                                    paddingBottom: '6px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid #2A2010',
                                    color: '#F0E6CC',
                                    fontSize: '11px',
                                    outline: 'none',
                                    transition: 'border-color 0.15s',
                                }}
                                onFocus={(e) => (e.target.style.borderBottomColor = '#FFB800')}
                                onBlur={(e) => (e.target.style.borderBottomColor = '#2A2010')}
                            />
                        </div>

                        {/* View toggle */}
                        <div style={{ border: '1px solid #2A2010', display: 'flex' }}>
                            {[
                                { mode: 'grid', Icon: Grid },
                                { mode: 'list', Icon: List },
                            ].map(({ mode, Icon }) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    style={{
                                        padding: '6px 8px',
                                        background: viewMode === mode ? '#FFB800' : 'transparent',
                                        color: viewMode === mode ? '#080705' : '#5A4A30',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <Icon size={13} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 transition-all"
                            style={{
                                ...MONO,
                                padding: '8px 14px',
                                border: '1px solid #2A2010',
                                background: 'transparent',
                                color: '#8A7A60',
                                fontSize: '11px',
                                letterSpacing: '0.1em',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#5A4A30';
                                e.currentTarget.style.color = '#F0E6CC';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#2A2010';
                                e.currentTarget.style.color = '#8A7A60';
                            }}
                        >
                            <FolderPlus size={13} />
                            NEW COLLECTION
                        </button>
                        <button
                            onClick={handleUploadDocument}
                            className="flex items-center gap-2 transition-colors"
                            style={{
                                ...MONO,
                                padding: '8px 16px',
                                background: '#FFB800',
                                color: '#080705',
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.1em',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#FFC933')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#FFB800')}
                        >
                            <Upload size={13} />
                            UPLOAD
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loadingStates?.documents || loadingStates?.collections ? (
                    <DocumentGridSkeleton viewMode={viewMode} count={8} />
                ) : (
                    <>
                        {/* Collections */}
                        {collections.length > 0 && (
                            <div className="mb-8">
                                <p style={{ color: '#5A4A30', fontSize: '10px', letterSpacing: '0.25em', marginBottom: '12px' }}>
                                    COLLECTIONS — {collections.length}
                                </p>
                                <div
                                    className={viewMode === 'grid'
                                        ? 'grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                        : 'flex flex-col gap-1'
                                    }
                                >
                                    {collections.map((col, i) => (
                                        <motion.div
                                            key={col._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={() => navigate(`/dashboard/collection/${col._id}`)}
                                            style={{
                                                border: '1px solid #2A2010',
                                                borderLeft: `2px solid ${col.color || '#FFB800'}`,
                                                background: '#0C0A06',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                padding: viewMode === 'list' ? '10px 16px' : '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#130F08';
                                                e.currentTarget.style.borderTopColor = '#3A3020';
                                                e.currentTarget.style.borderRightColor = '#3A3020';
                                                e.currentTarget.style.borderBottomColor = '#3A3020';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#0C0A06';
                                                e.currentTarget.style.borderTopColor = '#2A2010';
                                                e.currentTarget.style.borderRightColor = '#2A2010';
                                                e.currentTarget.style.borderBottomColor = '#2A2010';
                                            }}
                                        >
                                            <Folder size={14} style={{ color: col.color || '#FFB800', flexShrink: 0 }} />
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <p style={{ fontSize: '12px', fontWeight: 700, color: '#F0E6CC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {col.name}
                                                </p>
                                                <p style={{ fontSize: '10px', color: '#5A4A30', marginTop: '2px' }}>
                                                    {col.documentCount || 0} docs
                                                </p>
                                            </div>
                                            {viewMode === 'list' && (
                                                <span style={{ fontSize: '10px', color: '#3A3020', flexShrink: 0 }}>
                                                    {formatDate(col.createdAt)}
                                                </span>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        {documents.length > 0 && (
                            <div>
                                <p style={{ color: '#5A4A30', fontSize: '10px', letterSpacing: '0.25em', marginBottom: '12px' }}>
                                    DOCUMENTS — {documents.length}
                                </p>
                                <div
                                    className={viewMode === 'grid'
                                        ? 'grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                                        : 'flex flex-col gap-1'
                                    }
                                >
                                    {documents.map((doc, i) => (
                                        <motion.div
                                            key={doc._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="group"
                                            onClick={() => navigate(`/chat?doc=${doc._id}`)}
                                            style={{
                                                position: 'relative',
                                                border: '1px solid #2A2010',
                                                background: '#0C0A06',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                padding: viewMode === 'list' ? '10px 16px' : '16px',
                                                display: 'flex',
                                                alignItems: viewMode === 'list' ? 'center' : 'flex-start',
                                                gap: '10px',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#130F08';
                                                e.currentTarget.style.borderColor = 'rgba(255, 184, 0, 0.25)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = '#0C0A06';
                                                e.currentTarget.style.borderColor = '#2A2010';
                                            }}
                                        >
                                            {/* Action buttons */}
                                            <div
                                                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
                                                style={{ position: viewMode === 'grid' ? 'absolute' : 'static', top: '8px', right: '8px' }}
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(doc._id); }}
                                                    style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: doc.isFavorite ? '#FFB800' : '#5A4A30', transition: 'color 0.15s' }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FFB800')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = doc.isFavorite ? '#FFB800' : '#5A4A30')}
                                                >
                                                    <Star size={11} />
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Delete "${doc.title}"? This will also delete all chats.`)) {
                                                            const t = toast.loading('Deleting...');
                                                            try {
                                                                await deleteDocument(doc._id);
                                                                toast.dismiss(t);
                                                                toast.success('Document deleted');
                                                            } catch {
                                                                toast.dismiss(t);
                                                                toast.error('Failed to delete');
                                                            }
                                                        }
                                                    }}
                                                    style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#5A4A30', transition: 'color 0.15s' }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#5A4A30')}
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>

                                            <FileText size={13} style={{ color: '#5A4A30', flexShrink: 0, marginTop: viewMode === 'grid' ? '2px' : '0' }} />
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <p
                                                    title={doc.title}
                                                    style={{
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        color: '#F0E6CC',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        lineHeight: 1.3,
                                                        paddingRight: viewMode === 'grid' ? '40px' : '0',
                                                    }}
                                                >
                                                    {doc.title}
                                                </p>
                                                <p style={{ fontSize: '10px', color: '#5A4A30', marginTop: '3px' }}>
                                                    {formatFileSize(doc.fileSize)}
                                                </p>
                                                {doc.tags?.length > 0 && viewMode === 'grid' && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                                                        {doc.tags.slice(0, 2).map((tag, idx) => (
                                                            <span
                                                                key={idx}
                                                                style={{
                                                                    padding: '2px 6px',
                                                                    border: '1px solid #2A2010',
                                                                    color: '#5A4A30',
                                                                    fontSize: '9px',
                                                                    letterSpacing: '0.1em',
                                                                }}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {viewMode === 'list' && (
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    {doc.isFavorite && <Star size={11} style={{ color: '#FFB800' }} />}
                                                    <span style={{ fontSize: '10px', color: '#3A3020' }}>{formatDate(doc.uploadedAt)}</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Empty state */}
                {!loadingStates?.documents && !loadingStates?.collections && documents.length === 0 && collections.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '80px 24px',
                            border: '1px dashed #2A2010',
                        }}
                    >
                        <FileText size={24} style={{ color: '#3A3020', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#8A7A60', marginBottom: '8px', letterSpacing: '0.15em' }}>
                            NO DOCUMENTS
                        </h3>
                        <p style={{ fontSize: '11px', color: '#5A4A30', marginBottom: '24px' }}>
                            Upload a PDF or create a collection to begin
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button
                                onClick={handleUploadDocument}
                                style={{
                                    ...MONO,
                                    padding: '10px 20px',
                                    background: '#FFB800',
                                    color: '#080705',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#FFC933')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '#FFB800')}
                            >
                                UPLOAD DOCUMENT
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                style={{
                                    ...MONO,
                                    padding: '10px 20px',
                                    background: 'transparent',
                                    color: '#8A7A60',
                                    fontSize: '11px',
                                    letterSpacing: '0.1em',
                                    border: '1px solid #2A2010',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#5A4A30';
                                    e.currentTarget.style.color = '#F0E6CC';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#2A2010';
                                    e.currentTarget.style.color = '#8A7A60';
                                }}
                            >
                                CREATE COLLECTION
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <CreateCollectionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateCollection={async (data) => {
                    await createCollection(data);
                    toast.success('Collection created');
                }}
            />
        </div>
    );
};

export default Dashboard;
