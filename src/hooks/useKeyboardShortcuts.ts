import { useEffect } from 'react';
import { useCommandPalette } from './useCommandPalette';

/**
 * Global keyboard shortcuts.
 * Mount once at App root level.
 *
 * Shortcuts:
 *   Cmd+K / Ctrl+K  → Command Palette
 *   Escape           → Close Command Palette (handled inside CommandPalette)
 */
export function useKeyboardShortcuts() {
  const toggle = useCommandPalette((s) => s.toggle);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);
}
