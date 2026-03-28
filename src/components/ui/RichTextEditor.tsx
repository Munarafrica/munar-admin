import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { cn } from './utils';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Heading2,
  Undo2,
  Redo2,
  Type,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Describe your event...',
  error = false,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
          'min-h-[200px] p-4 text-[14px]',
          'text-slate-900 dark:text-slate-100',
          '[&>*]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'
        ),
      },
    },
  });

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    icon: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
        isActive && 'bg-slate-200 dark:bg-slate-700'
      )}
    >
      {Icon}
    </button>
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap gap-1 p-3 bg-slate-50 dark:bg-slate-900 rounded-t-lg border border-b-0 border-[#cbd5e1] dark:border-slate-800">
        {/* Text Style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 className="w-4 h-4" />}
          title="Heading"
        />

        <div className="w-px bg-slate-200 dark:bg-slate-700" />

        {/* Format */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<Bold className="w-4 h-4" />}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<Italic className="w-4 h-4" />}
          title="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={<UnderlineIcon className="w-4 h-4" />}
          title="Underline"
        />

        <div className="w-px bg-slate-200 dark:bg-slate-700" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<List className="w-4 h-4" />}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered className="w-4 h-4" />}
          title="Ordered List"
        />

        <div className="w-px bg-slate-200 dark:bg-slate-700" />

        {/* Code */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon={<Code className="w-4 h-4" />}
          title="Code Block"
        />

        <div className="w-px bg-slate-200 dark:bg-slate-700" />

        {/* Link */}
        <ToolbarButton
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          isActive={editor.isActive('link')}
          icon={<LinkIcon className="w-4 h-4" />}
          title="Add Link"
        />

        <div className="w-px bg-slate-200 dark:bg-slate-700" />

        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={<Undo2 className="w-4 h-4" />}
          title="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={<Redo2 className="w-4 h-4" />}
          title="Redo"
        />

        <div className="w-px bg-slate-200 dark:bg-slate-700" />

        {/* Clear */}
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().run()}
          icon={<Type className="w-4 h-4" />}
          title="Clear Formatting"
        />
      </div>

      {/* Editor */}
      <div
        className={cn(
          'bg-white dark:bg-slate-950 rounded-b-lg border overflow-hidden',
          error ? 'border-red-500' : 'border-[#cbd5e1] dark:border-slate-800'
        )}
      >
        <EditorContent
          editor={editor}
          className="[&_.ProseMirror]:focus:outline-none"
        />
      </div>
    </div>
  );
}
