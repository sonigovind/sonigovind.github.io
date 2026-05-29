'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';
import { SITE_CONFIG } from '@/data';

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#research', label: 'Research' },
  { href: '#publications', label: 'Publications' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const openPalette = useCallback(() => {
    setPaletteOpen(true);
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openPalette]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'var(--glass)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-2.5 font-display font-semibold text-sm"
            style={{ color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.01em' }}
          >
            <span
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#FFFFFF', fontSize: '0.65rem', letterSpacing: '0.04em' }}
            >
              GS
            </span>
            <span>{SITE_CONFIG.name}</span>
          </a>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const sectionId = href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <li key={href}>
                  <a
                    href={href}
                    className="relative px-4 py-2 rounded-lg text-sm transition-all duration-200"
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--text-2)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.target as HTMLElement).style.color = 'var(--text)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.target as HTMLElement).style.color = 'var(--text-2)';
                    }}
                  >
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                        style={{ background: 'var(--accent)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={openPalette}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--text-3)',
                fontFamily: 'var(--font-jetbrains)',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label="Open command palette"
            >
              <Command className="w-3 h-3" />
              <span>K</span>
            </motion.button>
            <ThemeToggle />
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen
                ? <X className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                : <Menu className="w-4 h-4" style={{ color: 'var(--text-2)' }} />
              }
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
              style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}
            >
              <ul className="flex flex-col px-6 py-5 gap-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-lg text-sm transition-colors"
                      style={{ color: 'var(--text-2)', textDecoration: 'none' }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
                <li className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={openPalette}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                    style={{ color: 'var(--text-3)' }}
                  >
                    <Command className="w-4 h-4" />
                    <span>Command palette</span>
                    <kbd
                      className="ml-auto text-xs px-2 py-0.5 rounded"
                      style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border)',
                        fontFamily: 'var(--font-jetbrains)',
                      }}
                    >
                      ⌘K
                    </kbd>
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
