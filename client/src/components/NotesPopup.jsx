import React, { useState, useEffect, useRef } from 'react';
import { X, Bold, Italic, List, ListOrdered, Download, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import useChatStore from '../utils/chatStore';

const ToolBtn = ({ active, onClick, children, title }) => (
    <button
        onClick={onClick}
        title={title}
        className={`p-1.5 rounded-lg transition-all text-sm ${
            active
                ? 'bg-violet-500/20 text-violet-300'
                : 'text-white/30 hover:text-white/70 hover:bg-white/[0.06]'
        }`}
    >
        {children}
    </button>
);

const MenuBar = ({ editor, onExport }) => {
    if (!editor) return null;
    return (
        <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.06]">
            <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                <Bold size={14} />
            </ToolBtn>
            <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                <Italic size={14} />
            </ToolBtn>
            <div className="w-px h-4 bg-white/[0.07] mx-1" />
            <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <span className="text-xs font-bold">H2</span>
            </ToolBtn>
            <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <span className="text-xs font-bold">H3</span>
            </ToolBtn>
            <div className="w-px h-4 bg-white/[0.07] mx-1" />
            <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <List size={14} />
            </ToolBtn>
            <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered size={14} />
            </ToolBtn>
            <ToolBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                <span className="text-xs font-mono">{'</>'}</span>
            </ToolBtn>
            <div className="flex-1" />
            <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white/70 rounded-lg border border-white/[0.07] transition-all"
                title="Export as Markdown"
            >
                <Download size={12} />
                Export
            </button>
        </div>
    );
};

const NotesPopup = ({ isOpen, onClose, currentPdf }) => {
    const [isSaving, setIsSaving] = useState(false);
    const saveTimer = useRef(null);
    const { updateNotes, getNotes } = useChatStore();

    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        onUpdate: ({ editor }) => {
            clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => handleUpdateNotes(editor.getHTML()), 800);
        },
    });

    useEffect(() => {
        if (isOpen && currentPdf?._id && editor) loadNotes();
        return () => clearTimeout(saveTimer.current);
    }, [isOpen, currentPdf?._id, editor]);

    const loadNotes = async () => {
        if (!currentPdf?._id || !editor) return;
        const notes = await getNotes(currentPdf._id);
        editor.commands.setContent(notes || '<p>Start taking notes here...</p>');
    };

    const handleUpdateNotes = async (content) => {
        if (!currentPdf?._id) return;
        setIsSaving(true);
        await updateNotes(currentPdf._id, content);
        setIsSaving(false);
    };

    const handleExport = () => {
        if (!editor) return;
        const blob = new Blob([editor.getText()], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentPdf?.title || 'notes'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl h-[80vh] bg-[#0D0D0E] border border-white/[0.07] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <h2 className="text-sm font-semibold text-white/80">Notes</h2>
                                {currentPdf && (
                                    <span className="text-xs text-white/30 truncate max-w-48">{currentPdf.title}</span>
                                )}
                                {isSaving && (
                                    <span className="flex items-center gap-1 text-[10px] text-white/20">
                                        <Save size={10} /> Saving...
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-white/30 hover:text-white/70 hover:bg-white/[0.06] rounded-lg transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <MenuBar editor={editor} onExport={handleExport} />

                        <div className="flex-1 overflow-auto">
                            <EditorContent
                                editor={editor}
                                className="h-full prose prose-invert prose-sm max-w-none p-4 text-white/70
                                    prose-headings:text-white/80 prose-headings:font-semibold
                                    prose-code:text-violet-300 prose-code:bg-violet-500/10 prose-code:rounded prose-code:px-1
                                    prose-pre:bg-white/[0.03] prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-xl
                                    prose-blockquote:border-l-violet-500/40 prose-blockquote:text-white/40
                                    [&_*:focus]:outline-none"
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotesPopup;
