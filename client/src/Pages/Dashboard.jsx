import { useState, useEffect } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { getUser } from '../utils/auth';
import useDocumentStore from '../utils/documentStore';
import useChatStore from '../utils/chatStore';
import { DocumentGridSkeleton } from '../components/LoadingSkeleton';
import CreateCollectionModal from '../components/CreateCollectionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Dashboard() {
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

  const stats = [
    {
      label: 'Documents',
      value: analytics?.overview?.totalDocuments ?? 0,
      icon: FileText,
      sub: null,
    },
    {
      label: 'Storage',
      value: formatFileSize(analytics?.overview?.totalFileSize || 0),
      icon: HardDrive,
      sub: analytics?.overview?.totalDocuments > 0
        ? `avg ${formatFileSize(analytics?.overview?.avgFileSize || 0)}`
        : null,
    },
    {
      label: 'Favorites',
      value: analytics?.overview?.favoriteCount ?? 0,
      icon: Star,
      sub: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 border-b border-zinc-800/60 bg-[#09090B]/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30">
              <Sparkles size={13} className="text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-zinc-100">LexiAI</span>
          </div>
          <span className="text-zinc-700">/</span>
          <span className="text-xs text-zinc-500 font-medium">Dashboard</span>
          {user && (
            <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-xs ml-1">
              {user.username}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => navigate('/chat')}
          className="bg-violet-600 hover:bg-violet-500 text-white gap-2 shadow-lg shadow-violet-900/20"
        >
          <MessageSquare size={13} />
          Open chat
        </Button>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {loadingStates?.analytics ? (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-zinc-900/50 border border-zinc-800/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {stats.map(({ label, value, icon: Icon, sub }) => (
              <Card key={label} className="bg-zinc-900/50 border-zinc-800/60">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={14} className="text-zinc-500" />
                    <span className="text-xs text-zinc-500 font-medium">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-zinc-100 tracking-tight">{value}</p>
                  {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800/60">
          <div className="flex items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 bg-zinc-800/60 border-zinc-700/60 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500/60 h-9"
              />
            </div>

            {/* View toggle */}
            <div className="flex rounded-lg bg-zinc-800/60 p-1 gap-0.5">
              {[{ mode: 'grid', Icon: Grid }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    viewMode === mode
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 hover:border-zinc-600 gap-2"
            >
              <FolderPlus size={13} />
              New collection
            </Button>
            <Button
              size="sm"
              onClick={handleUploadDocument}
              className="bg-violet-600 hover:bg-violet-500 text-white gap-2 shadow-md shadow-violet-900/20"
            >
              <Upload size={13} />
              Upload
            </Button>
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
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em] mb-3">
                  Collections — {collections.length}
                </p>
                <div className={viewMode === 'grid'
                  ? 'grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'flex flex-col gap-1.5'
                }>
                  {collections.map((col, i) => (
                    <motion.div
                      key={col._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => navigate(`/dashboard/collection/${col._id}`)}
                      className={`group flex items-center gap-3 cursor-pointer rounded-xl border border-zinc-800/60 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-zinc-700/60 transition-all duration-200 ${
                        viewMode === 'list' ? 'px-4 py-3' : 'p-4'
                      }`}
                      style={{ borderLeft: `3px solid ${col.color || '#7C3AED'}` }}
                    >
                      <Folder size={14} style={{ color: col.color || '#7C3AED' }} className="shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-100 truncate">{col.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{col.documentCount || 0} docs</p>
                      </div>
                      {viewMode === 'list' && (
                        <span className="text-xs text-zinc-600 shrink-0">{formatDate(col.createdAt)}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {documents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-[0.15em] mb-3">
                  Documents — {documents.length}
                </p>
                <div className={viewMode === 'grid'
                  ? 'grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'flex flex-col gap-1.5'
                }>
                  {documents.map((doc, i) => (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => navigate(`/chat?doc=${doc._id}`)}
                      className={`group relative flex cursor-pointer rounded-xl border border-zinc-800/60 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-zinc-700/60 hover:shadow-lg transition-all duration-200 ${
                        viewMode === 'list' ? 'items-center px-4 py-3 gap-3' : 'flex-col p-4 gap-2'
                      }`}
                    >
                      {/* Action buttons (grid mode absolute, list mode inline) */}
                      <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ${
                        viewMode === 'grid' ? 'absolute top-2 right-2' : ''
                      }`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(doc._id); }}
                          className={`p-1.5 rounded-md transition-colors ${
                            doc.isFavorite ? 'text-amber-400' : 'text-zinc-600 hover:text-amber-400'
                          }`}
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
                          className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <FileText size={14} className="text-zinc-600 group-hover:text-violet-400 shrink-0 transition-colors duration-200" />

                      <div className="min-w-0 flex-1">
                        <p
                          title={doc.title}
                          className={`text-sm font-medium text-zinc-100 truncate ${viewMode === 'grid' ? 'pr-8' : ''}`}
                        >
                          {doc.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">{formatFileSize(doc.fileSize)}</p>
                        {doc.tags?.length > 0 && viewMode === 'grid' && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.slice(0, 2).map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-zinc-700 text-zinc-500"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {viewMode === 'list' && (
                        <div className="flex items-center gap-3 shrink-0">
                          {doc.isFavorite && <Star size={11} className="text-amber-400" />}
                          <span className="text-xs text-zinc-600">{formatDate(doc.uploadedAt)}</span>
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
            className="flex flex-col items-center justify-center text-center py-24 rounded-xl border border-dashed border-zinc-800/80"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mb-4">
              <FileText size={20} className="text-zinc-600" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-1">No documents yet</h3>
            <p className="text-xs text-zinc-600 mb-6">Upload a PDF or create a collection to begin</p>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={handleUploadDocument}
                className="bg-violet-600 hover:bg-violet-500 text-white gap-2"
              >
                <Upload size={13} />
                Upload document
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateModal(true)}
                className="border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 gap-2"
              >
                <FolderPlus size={13} />
                Create collection
              </Button>
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
}
