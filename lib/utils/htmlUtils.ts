import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  try {
    return DOMPurify.sanitize(html);
  } catch (error) {
    console.error('Failed to sanitize HTML:', error);
    // In case of error, return the original string escaped or just empty to be safe
    return ''; 
  }
};

export const stripHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  try {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  } catch (error) {
    console.error('Failed to strip HTML:', error);
    return '';
  }
};
