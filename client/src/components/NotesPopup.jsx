import React, { useState, useEffect } from 'react';
import {
    X,
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import useChatStore from '../utils/chatStore';

const MenuBar = ({ editor }) => {
    if (!editor) return null;

    return (
        <div className="border-b border-gray-700 p-2 flex gap-2">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
                <Bold size={20} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
                <Italic size={20} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
                <List size={20} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
                <ListOrdered size={20} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded ${editor.isActive('heading') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
                <Heading size={20} />
            </button>
        </div>
    );
};

const NotesPopup = ({ isOpen, onClose, currentPdf }) => {
    const [isSaving, setIsSaving] = useState(false);
    const { updateNotes, getNotes } = useChatStore();

    const editor = useEditor({
        extensions: [StarterKit],
        content: '<p>Loading notes...</p>',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            handleUpdateNotes(html);
        },
    });

    useEffect(() => {
        if (isOpen && currentPdf?._id && editor) {
            loadNotes();
        }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg w-[800px] max-w-[90%] h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Notes</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-full transition-colors text-white"
                    >
                        <X size={24} />
                    </button>
                </div>
                <MenuBar editor={editor} />
                <div className="flex-1 overflow-auto">
                    <EditorContent
                        editor={editor}
                        className="h-full prose prose-invert max-w-none p-4 [&_*:focus]:outline-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default NotesPopup;