import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content using DOMPurify with a strict allowlist.
 * 
 * Security configuration:
 * - Only allows safe formatting tags (b, i, em, strong, p, ul, ol, li, br, a)
 * - Forbids all script-capable elements (script, iframe, object, embed, svg, etc.)
 * - Strips all event handler attributes (onclick, onerror, etc.)
 * - Blocks javascript:, data:, and vbscript: URL schemes
 * - Only allows http, https, and mailto links
 * - Adds rel="noopener noreferrer" to all links for security
 * 
 * This prevents XSS attacks while preserving basic text formatting.
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Configure DOMPurify with strict security settings
  const config = {
    // Allow only specific safe tags
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's',
      'p', 'br',
      'ul', 'ol', 'li',
      'a',
      'code', 'pre',
      'blockquote'
    ],
    
    // Allow only specific safe attributes
    ALLOWED_ATTR: [
      'href',    // for links
      'rel',     // for link security
      'target'   // for link behavior
    ],
    
    // Explicitly forbid dangerous tags
    FORBID_TAGS: [
      'script', 'style', 'iframe', 'object', 'embed',
      'link', 'meta', 'base', 'form', 'input', 'textarea',
      'button', 'select', 'option', 'svg', 'math',
      'video', 'audio', 'source', 'track', 'canvas',
      'img'  // Block images to prevent onerror handlers
    ],
    
    // Forbid all event handler attributes (onclick, onerror, onload, etc.)
    FORBID_ATTR: [
      'style',  // Prevent style-based attacks
      'onerror', 'onclick', 'onload', 'onmouseover', 'onmouseout',
      'onabort', 'onblur', 'onchange', 'ondblclick', 'onfocus',
      'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove',
      'onmouseup', 'onreset', 'onselect', 'onsubmit', 'onunload'
    ],
    
    // Only allow safe URL protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    
    // Keep safe HTML structure
    KEEP_CONTENT: true,
    
    // Return DOM fragment
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    
    // Add security attributes to links
    ADD_ATTR: ['rel', 'target'],
  };

  // Sanitize the HTML
  let sanitized = DOMPurify.sanitize(html, config) as string;
  
  // Post-process: ensure all external links have security attributes
  sanitized = sanitized.replace(
    /<a\s+([^>]*href=["'](?:https?:\/\/[^"']+)["'][^>]*)>/gi,
    (match, attrs) => {
      // Add rel="noopener noreferrer" if not present
      if (!attrs.includes('rel=')) {
        attrs += ' rel="noopener noreferrer"';
      }
      // Add target="_blank" if not present
      if (!attrs.includes('target=')) {
        attrs += ' target="_blank"';
      }
      return `<a ${attrs}>`;
    }
  );
  
  return sanitized;
}

/**
 * Validate and sanitize a stock note before storage or display.
 * Removes any malicious content while preserving legitimate formatting.
 * 
 * @param note - The note content to sanitize
 * @returns Sanitized note safe for storage and rendering
 */
export function sanitizeNote(note: string): string {
  return sanitizeHtml(note);
}
