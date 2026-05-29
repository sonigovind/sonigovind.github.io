'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Hash, BookOpen, ExternalLink, X, Command } from 'lucide-react';
import { COMMAND_ITEMS, type CommandItem } from '@/data';

type Props = {
  open: boolean;
  onClose: () => void;
};

const GROUP_ICONS: Record<string, React.ReactNode> = {
  Navigate: <Hash className="w-3.5 h-3.5" />,
  Publications: <BookOpen className="w-3.5 h-3.5" />,
  Links: <ExternalLink className="w-3.5 h-3.5" />,
};

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = COMMAND_ITEMS.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q)
    );
  });

  const groups = [...new Set(filtered.map((i) => i.group))];

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onClose();
      setQuery('');
      if (item.external) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else if (item.href.startsWith('#')) {
        const el = document.querySelector(item.href);
        el?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = item.href;
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIdx(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && filtered[activeIdx]) {
        handleSelect(filtered[activeIdx]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, activeIdx, handleSelect, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  let globalIdx = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }}
            className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              boxShadow: '0 40px 120px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-3)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, publications, links..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-inter)' }}
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-0.5 rounded">
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--text-3)' }} />
                </button>
              )}
              <kbd
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-3)',
                  fontFamily: 'var(--font-jetbrains)',
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                    No results for &quot;{query}&quot;
                  </p>
                </div>
              ) : (
                groups.map((group) => {
                  const items = filtered.filter((i) => i.group === group);
                  return (
                    <div key={group} className="mb-1">
                      <div
                        className="flex items-center gap-2 px-3 py-2 text-xs"
                        style={{
                          color: 'var(--text-3)',
                          fontFamily: 'var(--font-jetbrains)',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {GROUP_ICONS[group]}
                        {group}
                      </div>
                      {items.map((item) => {
                        globalIdx++;
                        const idx = globalIdx;
                        const isActive = activeIdx === idx;
                        return (
                          <button
                            key={item.id}
                            data-active={isActive}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className="cmd-item w-full text-left"
                            style={
                              isActive
                                ? {
                                    background: 'var(--accent-subtle)',
                                    borderLeft: '2px solid var(--accent)',
                                    paddingLeft: '12px',
                                  }
                                : {}
                            }
                          >
                            <div className="flex-1 min-w-0">
                              <div
                                className="text-sm font-medium truncate"
                                style={{ color: isActive ? 'var(--accent)' : 'var(--text)' }}
                              >
                                {item.label}
                              </div>
                              {item.description && (
                                <div
                                  className="text-xs truncate mt-0.5"
                                  style={{ color: 'var(--text-3)' }}
                                >
                                  {item.description}
                                </div>
                              )}
                            </div>
                            <ArrowRight
                              className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: 'var(--accent)', opacity: isActive ? 1 : 0 }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}
            >
              <div className="flex items-center gap-3">
                {[
                  { key: '↑↓', label: 'navigate' },
                  { key: '↵', label: 'select' },
                  { key: 'ESC', label: 'close' },
                ].map(({ key, label }) => (
                  <span key={key} className="flex items-center gap-1.5">
                    <kbd
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-3)',
                        fontFamily: 'var(--font-jetbrains)',
                      }}
                    >
                      {key}
                    </kbd>
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                      {label}
                    </span>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Command className="w-3 h-3" style={{ color: 'var(--text-3)' }} />
                <span className="text-xs" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-jetbrains)' }}>
                  K
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
