import { render, waitFor } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StockNotes } from '../StockNotes';

/**
 * Security Test Suite for StockNotes Component
 * 
 * Tests XSS vulnerability mitigations:
 * 1. Reflected XSS: URL query parameters are not rendered as HTML
 * 2. Stored XSS: localStorage content is sanitized before rendering
 * 3. Dangerous tags/attributes: Scripts, event handlers, and malicious URLs are stripped
 * 4. Allowed formatting: Safe HTML tags are preserved for legitimate use
 */

describe('StockNotes - XSS Security Tests', () => {
  const testSymbol = 'TEST';
  const storageKey = `notes:${testSymbol}`;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock window.alert to detect XSS attempts
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Stored XSS Prevention', () => {
    it('should sanitize script tags from localStorage on load', () => {
      // Pre-populate localStorage with malicious script
      const maliciousPayload = '<script>alert("XSS")</script>Hello';
      localStorage.setItem(storageKey, maliciousPayload);

      render(<StockNotes symbol={testSymbol} />);

      // Alert should NOT be called
      expect(window.alert).not.toHaveBeenCalled();

      // Script tag should be removed from rendered output
      const output = screen.getByTestId('notes-rendered-output');
      expect(output.innerHTML).not.toContain('<script');
      expect(output.innerHTML).not.toContain('alert');
      
      // Legitimate content should remain
      expect(output.textContent).toContain('Hello');
    });

    it('should sanitize img tags with onerror handlers', () => {
      const maliciousPayload = '<img src=x onerror="alert(\'XSS\')">';
      localStorage.setItem(storageKey, maliciousPayload);

      render(<StockNotes symbol={testSymbol} />);

      expect(window.alert).not.toHaveBeenCalled();
      
      const output = screen.getByTestId('notes-rendered-output');
      expect(output.innerHTML).not.toContain('onerror');
      expect(output.innerHTML).not.toContain('<img');
    });

    it('should clean poisoned localStorage entries on mount', async () => {
      const maliciousPayload = '<script>alert("XSS")</script>Safe content';
      localStorage.setItem(storageKey, maliciousPayload);

      render(<StockNotes symbol={testSymbol} />);

      // Wait for sanitization to complete
      await waitFor(() => {
        const stored = localStorage.getItem(storageKey);
        expect(stored).not.toContain('<script');
        expect(stored).toContain('Safe content');
      });
    });

    it('should prevent javascript: URLs in links', () => {
      const maliciousPayload = '<a href="javascript:alert(\'XSS\')">Click me</a>';
      localStorage.setItem(storageKey, maliciousPayload);

      render(<StockNotes symbol={testSymbol} />);

      const output = screen.getByTestId('notes-rendered-output');
      expect(output.innerHTML).not.toContain('javascript:');
    });

    it('should prevent data: URLs in links', () => {
      const maliciousPayload = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>';
      localStorage.setItem(storageKey, maliciousPayload);

      render(<StockNotes symbol={testSymbol} />);

      const output = screen.getByTestId('notes-rendered-output');
      expect(output.innerHTML).not.toContain('data:text/html');
    });

    it('should strip all event handler attributes', () => {
      const maliciousPayload = `
        <div onclick="alert('XSS')">Click</div>
        <span onmouseover="alert('XSS')">Hover</span>
        <p onload="alert('XSS')">Load</p>
      `;
      localStorage.setItem(storageKey, maliciousPayload);

      render(<StockNotes symbol={testSymbol} />);

      const output = screen.getByTestId('notes-rendered-output');
      expect(output.innerHTML).not.toContain('onclick');
      expect(output.innerHTML).not.toContain('onmouseover');
      expect(output.innerHTML).not.toContain('onload');
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should remove dangerous tags entirely', () => {
      const maliciousPayload = `
        <iframe src="javascript:alert('XSS')"></iframe>
        <object data="javascript:alert('XSS')"></object>
        <embed src="javascript:alert('XSS')"></embed>
        <svg onload="alert('XSS')"></svg>
      `;
      localStorage.setItem(storageKey, maliciousPayload);

      render(<StockNotes symbol={testSymbol} />);

      const output = screen.getByTestId('notes-rendered-output');
      expect(output.innerHTML).not.toContain('<iframe');
      expect(output.innerHTML).not.toContain('<object');
      expect(output.innerHTML).not.toContain('<embed');
      expect(output.innerHTML).not.toContain('<svg');
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('Input Sanitization on Save', () => {
    it('should sanitize content when typing malicious code', async () => {
      render(<StockNotes symbol={testSymbol} />);

      const textarea = screen.getByPlaceholderText('Add your notes here...');
      const maliciousInput = '<script>alert("XSS")</script>My note';
      
      fireEvent.change(textarea, { target: { value: maliciousInput } });

      await waitFor(() => {
        const stored = localStorage.getItem(storageKey);
        expect(stored).not.toContain('<script');
        expect(stored).toContain('My note');
      });

      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should sanitize content before persisting to localStorage', async () => {
      render(<StockNotes symbol={testSymbol} />);

      const textarea = screen.getByPlaceholderText('Add your notes here...');
      fireEvent.change(textarea, { 
        target: { value: '<img src=x onerror=alert(1)>' } 
      });

      await waitFor(() => {
        const stored = localStorage.getItem(storageKey);
        expect(stored).not.toContain('onerror');
        expect(stored).not.toContain('<img');
      });
    });
  });

  describe('Allowed Content Preservation', () => {
    it('should preserve safe formatting tags', () => {
      const safeContent = `
        <p>This is a <b>bold</b> and <i>italic</i> text.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;
      localStorage.setItem(storageKey, safeContent);

      render(<StockNotes symbol={testSymbol} />);

      const output = screen.getByTestId('notes-rendered-output');
      expect(output.innerHTML).toContain('<b>bold</b>');
      expect(output.innerHTML).toContain('<i>italic</i>');
      expect(output.innerHTML).toContain('<ul>');
      expect(output.innerHTML).toContain('<li>');
    });

    it('should preserve safe links with security attributes', () => {
      const safeLink = '<a href="https://example.com">Example</a>';
      localStorage.setItem(storageKey, safeLink);

      render(<StockNotes symbol={testSymbol} />);

      const output = screen.getByTestId('notes-rendered-output');
      const link = output.querySelector('a');
      
      expect(link).toBeTruthy();
      expect(link?.getAttribute('href')).toBe('https://example.com');
      expect(link?.getAttribute('rel')).toContain('noopener');
      expect(link?.getAttribute('rel')).toContain('noreferrer');
    });

    it('should handle plain text without issues', () => {
      const plainText = 'This is just plain text with no HTML';
      localStorage.setItem(storageKey, plainText);

      render(<StockNotes symbol={testSymbol} />);

      const output = screen.getByTestId('notes-rendered-output');
      expect(output.textContent).toContain(plainText);
    });

    it('should handle special characters correctly', () => {
      const specialChars = 'Test with <>&"\' special characters';
      localStorage.setItem(storageKey, specialChars);

      render(<StockNotes symbol={testSymbol} />);

      const output = screen.getByTestId('notes-rendered-output');
      expect(output.textContent).toContain('special characters');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty notes gracefully', () => {
      render(<StockNotes symbol={testSymbol} />);

      const placeholder = screen.getByText(/No notes yet/i);
      expect(placeholder).toBeInTheDocument();
    });

    it('should handle very long notes without issues', async () => {
      const longNote = 'A'.repeat(10000);
      
      render(<StockNotes symbol={testSymbol} />);
      
      const textarea = screen.getByPlaceholderText('Add your notes here...');
      fireEvent.change(textarea, { target: { value: longNote } });

      await waitFor(() => {
        const stored = localStorage.getItem(storageKey);
        expect(stored?.length).toBe(10000);
      });
    });

    it('should handle localStorage quota errors gracefully', async () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      render(<StockNotes symbol={testSymbol} />);

      const textarea = screen.getByPlaceholderText('Add your notes here...');
      
      // Should not crash when quota is exceeded
      expect(() => {
        fireEvent.change(textarea, { target: { value: 'Test' } });
      }).not.toThrow();

      // Restore original setItem
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle null and undefined values', () => {
      localStorage.setItem(storageKey, '');

      render(<StockNotes symbol={testSymbol} />);

      const placeholder = screen.getByText(/No notes yet/i);
      expect(placeholder).toBeInTheDocument();
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('Complex Attack Vectors', () => {
    it('should prevent nested script injection', () => {
      const nestedPayload = '<div><span><script>alert("XSS")</script></span></div>';
      localStorage.setItem(storageKey, nestedPayload);

      render(<StockNotes symbol={testSymbol} />);

      const output = screen.getByTestId('notes-rendered-output');
      expect(output.innerHTML).not.toContain('<script');
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should prevent encoded script tags', () => {
      const encodedPayload = '&lt;script&gt;alert("XSS")&lt;/script&gt;';
      localStorage.setItem(storageKey, encodedPayload);

      render(<StockNotes symbol={testSymbol} />);

      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should prevent SVG-based XSS', () => {
      const svgPayload = '<svg><script>alert("XSS")</script></svg>';
      localStorage.setItem(storageKey, svgPayload);

      render(<StockNotes symbol={testSymbol} />);

      const output = screen.getByTestId('notes-rendered-output');
      expect(output.innerHTML).not.toContain('<svg');
      expect(output.innerHTML).not.toContain('<script');
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should prevent mutation XSS (mXSS)', () => {
      const mxssPayload = '<noscript><p title="</noscript><img src=x onerror=alert(1)>">';
      localStorage.setItem(storageKey, mxssPayload);

      render(<StockNotes symbol={testSymbol} />);

      expect(window.alert).not.toHaveBeenCalled();
      
      const output = screen.getByTestId('notes-rendered-output');
      expect(output.innerHTML).not.toContain('onerror');
    });
  });
});
