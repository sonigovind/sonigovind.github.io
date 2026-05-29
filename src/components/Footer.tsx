'use client';

import { SITE_CONFIG } from '@/data';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
          © {year} {SITE_CONFIG.name} · IIT Bombay
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
          Last updated:{' '}
          <span style={{ color: 'var(--text-2)' }}>{SITE_CONFIG.lastUpdated}</span>
        </p>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          Built with{' '}
          <span style={{ color: 'var(--accent)' }}>Next.js</span>
          {' · '}
          <span style={{ color: 'var(--accent)' }}>Framer Motion</span>
        </p>
      </div>
    </footer>
  );
}
