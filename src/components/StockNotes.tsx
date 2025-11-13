import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeNote } from "@/utils/sanitize";

interface StockNotesProps {
  symbol: string;
}

/**
 * StockNotes Component - Secure note-taking for stock symbols
 * 
 * Security measures implemented:
 * - All HTML content sanitized using DOMPurify before rendering or storage
 * - Reflected XSS prevented: URL query parameters are NOT rendered as HTML
 * - Stored XSS prevented: Content sanitized on read and write to localStorage
 * - Previously poisoned localStorage entries are cleaned on component mount
 * - Strict allowlist of HTML tags prevents script execution
 * 
 * OWASP XSS Prevention: 
 * - Rule #2: Sanitize HTML markup with a vetted library before inserting
 * - Rule #3: JavaScript encode before inserting untrusted data
 * - Rule #6: Use strict Content Security Policy (see index.html)
 */
export function StockNotes({ symbol }: StockNotesProps) {
  const storageKey = useMemo(() => `notes:${symbol}`, [symbol]);
  
  const [text, setText] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(storageKey) ?? "";
      
      // Security: Sanitize on load to neutralize any previously injected XSS payloads
      // This cleans up any malicious HTML that may have been stored before security measures
      const sanitized = sanitizeNote(stored);
      
      // Write sanitized version back to storage to permanently remove poisoned content
      if (stored !== sanitized && stored !== "") {
        try {
          localStorage.setItem(storageKey, sanitized);
        } catch {
          // Ignore storage errors (quota exceeded, etc.)
        }
      }
      
      return sanitized;
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      // Security: Sanitize before persisting to prevent storing malicious content
      // This ensures only safe HTML is ever written to localStorage
      const sanitized = sanitizeNote(text);
      localStorage.setItem(storageKey, sanitized);
      
      // Update state if sanitization changed the content
      // This prevents the UI from showing unsanitized content
      if (text !== sanitized) {
        setText(sanitized);
      }
    } catch {
      // Ignore storage errors (quota exceeded, private browsing, etc.)
    }
  }, [storageKey, text]);

  // Security: Sanitize the current text for safe rendering
  // This is the final defense before rendering to prevent any XSS
  const safeHtml = useMemo(() => sanitizeNote(text), [text]);

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Write notes for {symbol}</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add your notes here..."
            className="min-h-[120px]"
          />
        </div>

        <div className="border-t border-border/50 pt-4">
          <div className="text-sm font-medium mb-2">Rendered Output</div>
          {/* 
            Security: Only sanitized HTML is rendered to prevent XSS attacks
            - DOMPurify removes all dangerous elements, attributes, and protocols
            - Strict allowlist prevents script execution
            - Event handlers (onclick, onerror, etc.) are stripped
            - javascript:, data:, and vbscript: URLs are blocked
          */}
          {safeHtml ? (
            <div 
              className="prose prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: safeHtml }}
              data-testid="notes-rendered-output"
            />
          ) : (
            <div className="text-sm text-muted-foreground italic">
              No notes yet. Start typing above...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


