## Issue Identified
The build is failing due to an incorrect import statement for the `TextStyle` extension from TipTap. The error indicates that `TextStyle` is not exported as a default export from `@tiptap/extension-text-style`.

## Root Cause
The import statement on line 13 of `RichTextEditor.tsx` is using a default import when it should be using a named import.

## Solution
Change the import statement from:
```typescript
import TextStyle from '@tiptap/extension-text-style';
```
to:
```typescript
import { TextStyle } from '@tiptap/extension-text-style';
```

## Implementation Plan
1. Fix the import statement in `RichTextEditor.tsx`
2. Run a build test to verify the fix
3. Test the rich text editor functionality in the tour page description section
4. Verify all formatting options work correctly
5. Document any additional configuration changes needed

## Expected Outcome
- Successful build without errors
- Rich text editor displays properly in the tour page description section
- All formatting options (bold, italic, underline, colors, etc.) work as expected
- Content is properly saved and loaded
- Cross-browser compatibility maintained