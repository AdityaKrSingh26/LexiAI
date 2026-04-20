import React, { useState } from 'react';
import { X, Share2, Copy, Check, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import useDocumentStore from '../utils/documentStore';

const ShareModal = ({ document, onClose }) => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('read');
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);
    const { shareDocument } = useDocumentStore();

    if (!document) return null;

    const shareUrl = `${window.location.origin}/chat?pdf=${document._id}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter an email address');
            return;
        }
        setIsSharing(true);
        try {
            await shareDocument(document._id, email.trim(), permission);
            toast.success(`Document shared with ${email}!`);
            setEmail('');
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to share document';
            toast.error(msg);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-400" />
                        <h2 className="text-white text-lg font-semibold">Share Document</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-400 text-sm mb-4 truncate">
                    <span className="text-gray-300 font-medium">{document.title}</span>
                </p>

                {/* Copy Link */}
                <div className="mb-6">
                    <label className="text-gray-300 text-sm font-medium mb-2 block">Share Link</label>
                    <div className="flex gap-2">
                        <input
                            readOnly
                            value={shareUrl}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 text-sm truncate"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 rounded-lg px-3 py-2 text-sm transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Share via Email */}
                <form onSubmit={handleShare}>
                    <label className="text-gray-300 text-sm font-medium mb-2 block">
                        Share with a user
                    </label>
                    <div className="flex gap-2 mb-3">
                        <div className="flex-1 relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={permission}
                            onChange={(e) => setPermission(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-blue-500"
                        >
                            <option value="read">View</option>
                            <option value="write">Edit</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isSharing}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg text-sm transition-colors"
                    >
                        {isSharing ? 'Sharing...' : 'Share'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ShareModal;
