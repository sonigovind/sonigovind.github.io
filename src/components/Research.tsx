'use client';

import { motion } from 'framer-motion';
import {
  Code2,
  Languages,
  FileSearch,
  Smile,
  Cpu,
  Globe,
} from 'lucide-react';
import { RESEARCH_AREAS } from '@/data';

const ICONS: Record<string, React.ReactNode> = {
  code: <Code2 className="w-5 h-5" />,
  translate: <Languages className="w-5 h-5" />,
  entity: <FileSearch className="w-5 h-5" />,
  sentiment: <Smile className="w-5 h-5" />,
  transformer: <Cpu className="w-5 h-5" />,
  multilingual: <Globe className="w-5 h-5" />,
};

export default function Research() {
  return (
    <section id="research" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-center mb-16"
        >
          <span className="section-label flex items-center justify-center gap-2 mb-4">
            <span className="inline-block w-8 h-px" style={{ background: 'var(--accent)' }} />
            Research Focus
            <span className="inline-block w-8 h-px" style={{ background: 'var(--accent)' }} />
          </span>
          <h2
            className="font-display font-extrabold text-3xl lg:text-4xl mb-4"
            style={{ color: 'var(--text)' }}
          >
            What I Work On
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--text-2)' }}>
            My active research directions span multimodal AI, low-resource NLP, and
            language model fine-tuning.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RESEARCH_AREAS.map((area, i) => (
            <motion.article
              key={area.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="card-base p-6 group"
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-colors duration-200"
                style={{
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--border-hover)',
                  color: 'var(--accent)',
                }}
              >
                {ICONS[area.iconKey]}
              </div>

              {/* Title + status */}
              <div className="flex items-start gap-2 mb-3">
                <h3
                  className="font-display font-semibold text-base leading-snug flex-1"
                  style={{ color: 'var(--text)' }}
                >
                  {area.title}
                </h3>
                {area.status === 'Current' && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-mono"
                    style={{
                      background: 'rgba(34,197,94,0.12)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      color: '#4ade80',
                      fontSize: '0.6rem',
                    }}
                  >
                    Current
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-2)' }}>
                {area.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {area.tags.map((tag) => (
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
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
