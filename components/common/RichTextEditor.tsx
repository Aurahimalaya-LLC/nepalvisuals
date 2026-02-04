import React, { useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Youtube from '@tiptap/extension-youtube';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

const MenuButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: string;
    title?: string;
}> = ({ onClick, isActive, disabled, icon, title }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-1.5 rounded hover:bg-admin-background transition-colors ${
            isActive ? 'bg-admin-primary/10 text-admin-primary' : 'text-admin-text-secondary'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
);

const ColorPicker: React.FC<{
    editor: Editor;
}> = ({ editor }) => {
    return (
        <div className="flex items-center gap-1 border-r border-admin-border pr-1 mr-1">
            <input
                type="color"
                onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
                value={editor.getAttributes('textStyle').color || '#000000'}
                className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                title="Text Color"
            />
             <MenuButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                isActive={editor.isActive('highlight')}
                icon="ink_highlighter"
                title="Highlight"
            />
        </div>
    );
};


const MenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }

    const addImage = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (input.files?.length) {
                const file = input.files[0];
                const alt = window.prompt('Enter image alt text');
                
                // Convert to Data URL for local preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    editor.chain().focus().setImage({ 
                        src: e.target?.result as string, 
                        alt: alt || '',
                        title: alt || '' 
                    }).run();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }, [editor]);

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addYoutube = useCallback(() => {
        const url = window.prompt('Enter YouTube URL');

        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    }, [editor]);

    return (
        <div className="border-b border-admin-border p-2 flex flex-wrap gap-1 bg-admin-surface rounded-t-lg sticky top-0 z-10">
            {/* History */}
            <div className="flex items-center border-r border-admin-border pr-1 mr-1">
                <MenuButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    icon="undo"
                    title="Undo"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    icon="redo"
                    title="Redo"
                />
            </div>

            {/* Colors & Highlights */}
            <ColorPicker editor={editor} />

            {/* Text Style */}
            <div className="flex items-center border-r border-admin-border pr-1 mr-1">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    icon="format_bold"
                    title="Bold"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    icon="format_italic"
                    title="Italic"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    icon="format_underlined"
                    title="Underline"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    icon="format_strikethrough"
                    title="Strikethrough"
                />
            </div>

            {/* Headings */}
            <div className="flex items-center border-r border-admin-border pr-1 mr-1">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    icon="format_h1"
                    title="Heading 1"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    icon="format_h2"
                    title="Heading 2"
                />
                 <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    icon="format_h3"
                    title="Heading 3"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    isActive={editor.isActive('heading', { level: 4 })}
                    icon="format_h4"
                    title="Heading 4"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                    isActive={editor.isActive('heading', { level: 5 })}
                    icon="format_h5"
                    title="Heading 5"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                    isActive={editor.isActive('heading', { level: 6 })}
                    icon="format_h6"
                    title="Heading 6"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    isActive={editor.isActive('paragraph')}
                    icon="format_paragraph"
                    title="Paragraph"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    icon="format_quote"
                    title="Quote"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    icon="code"
                    title="Code Block"
                />
            </div>

            {/* Alignment */}
            <div className="flex items-center border-r border-admin-border pr-1 mr-1">
                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    icon="format_align_left"
                    title="Align Left"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    icon="format_align_center"
                    title="Align Center"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    icon="format_align_right"
                    title="Align Right"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    isActive={editor.isActive({ textAlign: 'justify' })}
                    icon="format_align_justify"
                    title="Justify"
                />
            </div>

            {/* Lists */}
            <div className="flex items-center border-r border-admin-border pr-1 mr-1">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    icon="format_list_bulleted"
                    title="Bullet List"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    icon="format_list_numbered"
                    title="Ordered List"
                />
            </div>

            {/* Insertions */}
            <div className="flex items-center gap-1">
                <MenuButton
                    onClick={setLink}
                    isActive={editor.isActive('link')}
                    icon="link"
                    title="Link"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    disabled={!editor.isActive('link')}
                    icon="link_off"
                    title="Unlink"
                />
                <MenuButton
                    onClick={addImage}
                    icon="image"
                    title="Insert Image"
                />
                <MenuButton
                    onClick={addYoutube}
                    icon="smart_display"
                    title="Insert YouTube Video"
                />
                <MenuButton
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    icon="table_chart"
                    title="Insert Table"
                />
            </div>
             {/* Table Controls (only show if table is active) */}
             {editor.isActive('table') && (
                <div className="flex items-center border-l border-admin-border pl-1 ml-1 gap-1">
                     <MenuButton
                        onClick={() => editor.chain().focus().deleteTable().run()}
                        icon="table_rows" 
                        title="Delete Table"
                    />
                    <MenuButton onClick={() => editor.chain().focus().addColumnAfter().run()} icon="view_column" title="Add Column" />
                    <MenuButton onClick={() => editor.chain().focus().addRowAfter().run()} icon="table_rows" title="Add Row" />
                     <MenuButton onClick={() => editor.chain().focus().deleteColumn().run()} icon="delete" title="Delete Column" />
                    <MenuButton onClick={() => editor.chain().focus().deleteRow().run()} icon="delete" title="Delete Row" />
                </div>
            )}
        </div>
    );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder, className }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-admin-primary hover:underline cursor-pointer',
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                    loading: 'lazy',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'w-full border-collapse border border-admin-border my-4',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'bg-admin-background font-semibold p-2 border border-admin-border text-left',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'p-2 border border-admin-border',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write something...',
            }),
            Youtube.configure({
                controls: false,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 text-admin-text-primary',
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (readerEvent) => {
                            const node = view.state.schema.nodes.image.create({
                                src: readerEvent.target?.result,
                            });
                            const transaction = view.state.tr.replaceSelectionWith(node);
                            view.dispatch(transaction);
                        };
                        reader.readAsDataURL(file);
                        return true; // handled
                    }
                }
                return false;
            },
        },
    });

    return (
        <div className={`border border-admin-border rounded-lg bg-admin-surface shadow-sm overflow-hidden ${className}`}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};
