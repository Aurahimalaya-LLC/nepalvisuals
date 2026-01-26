# Rich Text Editor Documentation

## Overview
The `RichTextEditor` component provides a comprehensive WYSIWYG editing experience using [TipTap](https://tiptap.dev/), a headless wrapper around ProseMirror. It is designed to integrate seamlessly with the Nepal Visuals Trekking Admin Panel styling (Tailwind CSS) and offers a wide range of formatting options.

## Features
- **Text Formatting:** Bold, Italic, Underline, Strikethrough.
- **Typography:** Headings (H1, H2), Paragraphs.
- **Lists:** Bulleted lists, Numbered lists.
- **Alignment:** Left, Center, Right, Justify.
- **Media:** Image insertion (via URL), Link management.
- **Tables:** Create tables, add/delete rows and columns.
- **History:** Undo/Redo support.
- **UI:** Responsive toolbar, sticky positioning, Material Symbols icons.
- **Output:** Clean, sanitized HTML string.

## Implementation Instructions

### 1. Dependencies
The editor relies on several TipTap packages. Ensure the following are installed:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-placeholder
```

### 2. Styling
The editor content uses the `@tailwindcss/typography` plugin for consistent styling. Ensure this plugin is included in your Tailwind configuration or loaded via CDN.

In `index.html` (if using CDN):
```html
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
```

### 3. Usage
Import and use the component in your forms.

```tsx
import { RichTextEditor } from '../components/common/RichTextEditor';

// Inside your component
<RichTextEditor
    content={formData.description}
    onChange={(html) => setFormData({ ...formData, description: html })}
    placeholder="Enter description..."
    className="min-h-[300px]"
/>
```

## API Reference

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `content` | `string` | The initial HTML content of the editor. | Required |
| `onChange` | `(html: string) => void` | Callback function fired on every change. Returns the current HTML string. | Required |
| `placeholder` | `string` | Placeholder text when the editor is empty. | `'Write something...'` |
| `className` | `string` | Additional CSS classes for the container wrapper. | `undefined` |

## Customization Options
- **Extensions:** You can add more TipTap extensions in `RichTextEditor.tsx` inside the `useEditor` hook.
- **Toolbar:** Modify `MenuBar` component in `RichTextEditor.tsx` to add or remove buttons.
- **Styles:** Update `editorProps.attributes.class` in `RichTextEditor.tsx` to change the editor content styling (e.g., padding, prose configuration).

## Troubleshooting

### Icons not showing?
Ensure `Material Symbols Outlined` font is loaded in `index.html`.
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

### Styles looking broken?
Check if the `prose` class is working. This requires the `@tailwindcss/typography` plugin. If you are using a local `tailwind.config.js`, install the plugin via npm and add it to the plugins array.

### Content not updating?
The editor is a controlled component regarding its initial content, but it manages its own internal state for performance. The `onChange` handler ensures your parent state stays in sync. If you programmatically change `content` prop *after* initialization, TipTap doesn't automatically re-render the new content by default without a `useEffect` watching the content prop (not currently implemented to prevent cursor jumping). It is best used for initial load + user edits.
