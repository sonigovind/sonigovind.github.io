'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, Check, ExternalLink, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { PUBLICATIONS, type Publication } from '@/data';
import { copyToClipboard } from '@/lib/utils';

type Filter = 'All' | 'Conference' | 'Book Chapter' | 'Book';
const FILTERS: Filter[] = ['All', 'Conference', 'Book Chapter', 'Book'];

const TYPE_CLASS: Record<string, string> = {
  Conference: 'pub-type-conference',
  'Book Chapter': 'pub-type-book-chapter',
  Book: 'pub-type-book',
};

function PubCard({ pub, delay }: { pub: Publication; delay: number }) {
  const [bibOpen, setBibOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(pub.bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const }}
      className="card-base p-6"
      style={pub.featured ? { borderLeft: '3px solid var(--accent)' } : {}}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`pub-type-badge ${TYPE_CLASS[pub.type]}`}>{pub.type}</span>
          {pub.featured && (
            <span
              className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-mono"
              style={{
                background: 'var(--accent-subtle)',
                border: '1px solid var(--border-hover)',
                color: 'var(--accent)',
                fontSize: '0.6rem',
              }}
            >
              <Star className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
        </div>
        <span
          className="text-xs font-mono"
          style={{ color: 'var(--text-3)' }}
        >
          {pub.year}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-display font-semibold text-base lg:text-lg leading-snug mb-3"
        style={{ color: 'var(--text)' }}
      >
        {pub.title}
      </h3>

      {/* Authors */}
      <p className="text-sm mb-1">
        <span
          className="font-medium"
          style={{ color: 'var(--accent-light)' }}
        >
          {pub.authors.split(' and ')[0]}
        </span>
        {pub.authors.includes(' and ') && (
          <span style={{ color: 'var(--text-2)' }}>
            {' and ' + pub.authors.split(' and ').slice(1).join(' and ')}
          </span>
        )}
      </p>

      {/* Venue */}
      <p className="text-xs mb-5" style={{ color: 'var(--text-3)' }}>
        {pub.venue}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {pub.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-0.5 rounded-full"
            style={{
              background: 'var(--border)',
              color: 'var(--text-3)',
              fontSize: '0.65rem',
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <motion.button
          onClick={() => setBibOpen(!bibOpen)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-mono"
          style={{
            background: 'var(--accent-subtle)',
            border: '1px solid var(--border-hover)',
            color: 'var(--accent)',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {bibOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          BibTeX
        </motion.button>

        <motion.button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
          style={{
            background: 'var(--border)',
            border: '1px solid var(--border)',
            color: copied ? '#4ade80' : 'var(--text-2)',
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {copied ? (
            <><Check className="w-3 h-3" /> Copied</>
          ) : (
            <><Copy className="w-3 h-3" /> Copy BibTeX</>
          )}
        </motion.button>

        {pub.doiUrl && (
          <motion.a
            href={pub.doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md"
            style={{
              background: 'var(--border)',
              border: '1px solid var(--border)',
              color: 'var(--text-2)',
              textDecoration: 'none',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <ExternalLink className="w-3 h-3" />
            DOI
          </motion.a>
        )}
      </div>

      {/* BibTeX block */}
      <AnimatePresence>
        {bibOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bibtex-code mt-4">{pub.bibtex}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function Publications() {
  const [filter, setFilter] = useState<Filter>('All');
  const [query, setQuery] = useState('');

  const filtered = PUBLICATIONS.filter((pub) => {
    const matchesFilter = filter === 'All' || pub.type === filter;
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      pub.title.toLowerCase().includes(q) ||
      pub.authors.toLowerCase().includes(q) ||
      pub.tags.some((t) => t.toLowerCase().includes(q)) ||
      pub.venue.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  return (
    <section id="publications" className="py-24 section-alt">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-10"
        >
          <h2
            className="font-display font-bold text-2xl lg:text-3xl mb-3"
            style={{ color: 'var(--text)' }}
          >
            Publications
          </h2>
          <div className="h-px w-16 mb-4" style={{ background: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Peer-reviewed publications in NLP, Neural Machine Translation, and Biomedical AI.
          </p>
        </motion.div>

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
          className="flex flex-col sm:flex-row gap-4 mb-10"
        >
          {/* Search */}
          <div
            className="flex items-center gap-3 flex-1 px-4 py-2.5 rounded-xl"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
            }}
          >
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-3)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search publications..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-inter)' }}
            />
          </div>

          {/* Filter tabs */}
          <div
            className="flex items-center rounded-xl p-1 gap-1 overflow-x-auto"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              scrollbarWidth: 'none',
            }}
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 font-medium flex-shrink-0"
                style={{
                  background: filter === f ? 'var(--accent)' : 'transparent',
                  color: filter === f ? 'var(--bg)' : 'var(--text-2)',
                  fontWeight: filter === f ? 600 : 400,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Publications List */}
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((pub, i) => (
                <PubCard key={pub.id} pub={pub} delay={i * 0.08} />
              ))
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center"
              >
                <p style={{ color: 'var(--text-3)' }}>
                  No publications match your search.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
