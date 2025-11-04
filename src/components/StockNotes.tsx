import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeHtml } from "@/utils/sanitize";

interface StockNotesProps {
  symbol: string;
}

/**
 * StockNotes component - Secure note-taking for stock symbols
 * 
 * Security measures implemented:
 * - All HTML content is sanitized using DOMPurify before rendering
 * - No reflection of URL query parameters as HTML (XSS prevention)
 * - Content sanitized on both read and write to localStorage
 * - Previously poisoned localStorage entries are cleaned on load
 */
export function StockNotes({ symbol }: StockNotesProps) {
  const storageKey = useMemo(() => `notes:${symbol}`, [symbol]);
  
  const [text, setText] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(storageKey) ?? "";
      // Sanitize on load to clean any previously poisoned entries
      const sanitized = sanitizeHtml(stored);
      
      // Write sanitized version back to storage to prevent re-poisoning
      if (stored !== sanitized && stored !== "") {
        localStorage.setItem(storageKey, sanitized);
      }
      
      return sanitized;
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      // Sanitize before persisting to prevent storing malicious content
      const sanitized = sanitizeHtml(text);
      localStorage.setItem(storageKey, sanitized);
    } catch {
      // ignore storage errors
    }
  }, [storageKey, text]);

  // Sanitize the current text for safe rendering
  const safeHtml = useMemo(() => sanitizeHtml(text), [text]);

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
          {/* Security: Only sanitized HTML is rendered to prevent XSS attacks */}
          {safeHtml ? (
            <div 
              className="prose prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: safeHtml }} 
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


