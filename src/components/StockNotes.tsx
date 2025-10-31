import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface StockNotesProps {
  symbol: string;
}

// Intentionally vulnerable component for demo purposes:
// - Stored XSS: saves raw HTML to localStorage and renders it
// - DOM-based/reflected XSS: echoes the `q` query param when notes are empty
export function StockNotes({ symbol }: StockNotesProps) {
  const storageKey = useMemo(() => `notes:${symbol}`, [symbol]);
  const [text, setText] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKey) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, text);
    } catch {
      // ignore
    }
  }, [storageKey, text]);

  // Reflected XSS source
  const reflected = useMemo(() => new URLSearchParams(location.search).get("q") || "", []);

  // Intentionally render unsanitized HTML content
  const html = text || reflected;

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
          {/* Vulnerability: direct HTML injection from user input or URL query param */}
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </CardContent>
    </Card>
  );
}


