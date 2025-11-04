import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * 
 * Uses DOMPurify with a strict allowlist of safe tags and attributes.
 * This prevents malicious script execution while preserving basic formatting.
 * 
 * Security considerations:
 * - Blocks all script tags and event handlers (onerror, onclick, etc.)
 * - Removes javascript: and data: URLs from links
 * - Strips dangerous tags like iframe, object, embed
 * - Only allows safe formatting tags for rich text
 * 
 * @param html - Raw HTML string that may contain malicious content
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtml(html: string): string {
  // Strict configuration to prevent XSS
  const config = {
    // Allow only safe HTML tags for basic formatting
    ALLOWED_TAGS: [
      'p', 'b', 'i', 'em', 'strong', 'u', 's', 
      'a', 'ul', 'ol', 'li', 'br', 'code', 'pre', 
      'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ],
    
    // Allow only safe attributes (primarily for links)
    ALLOWED_ATTR: ['href', 'title', 'rel', 'target'],
    
    // Explicitly forbid dangerous tags
    FORBID_TAGS: [
      'script', 'style', 'iframe', 'object', 'embed', 
      'link', 'meta', 'base', 'form', 'input'
    ],
    
    // Block all event handler attributes (on*)
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    
    // Use HTML profile for web content
    USE_PROFILES: { html: true },
    
    // Keep whitespace for readability
    KEEP_CONTENT: true,
  };

  // Sanitize and return safe HTML
  const sanitized = DOMPurify.sanitize(html, config);
  
  return sanitized;
}

/**
 * Sanitizes and normalizes links to ensure they open safely.
 * Adds rel="noopener noreferrer" to external links.
 * 
 * @param html - HTML string containing links
 * @returns HTML with normalized safe links
 */
export function sanitizeWithSafeLinks(html: string): string {
  let sanitized = sanitizeHtml(html);
  
  // Add security attributes to links
  // This is done post-sanitization to ensure links are already safe
  sanitized = sanitized.replace(
    /<a\s+([^>]*href=['"][^'"]*['"][^>]*)>/gi,
    (match, attributes) => {
      // Add security attributes if not present
      if (!attributes.includes('rel=')) {
        attributes += ' rel="noopener noreferrer"';
      }
      if (!attributes.includes('target=') && attributes.includes('http')) {
        attributes += ' target="_blank"';
      }
      return `<a ${attributes}>`;
    }
  );
  
  return sanitized;
}
