'use client';

import { motion } from 'framer-motion';
import { EXPERIENCE, EDUCATION } from '@/data';

function TimelineCard({
  item,
  index,
  isLast,
}: {
  item: (typeof EXPERIENCE)[0];
  index: number;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
      className="relative pl-8 pb-8"
    >
      {/* Dot */}
      <div className="absolute left-0 top-1 flex flex-col items-center">
        <div className="timeline-dot" />
        {!isLast && <div className="timeline-line" />}
      </div>

      {/* Card */}
      <div className="card-base p-5">
        {/* Period badge */}
        {item.period && (
          <span className="badge inline-block mb-3">{item.period}</span>
        )}

        {/* Title */}
        <h4
          className="font-display font-semibold text-base mb-1"
          style={{ color: 'var(--text)' }}
        >
          {item.title}
        </h4>

        {/* Org */}
        <div className="flex items-center gap-2 mb-3">
          <p
            className="text-xs font-mono"
            style={{ color: 'var(--accent-light)', opacity: 0.8 }}
          >
            {item.org}
          </p>
          {item.meta && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{
                background: 'var(--border)',
                color: 'var(--text-3)',
                fontSize: '0.6rem',
              }}
            >
              {item.meta}
            </span>
          )}
        </div>

        {/* Description or bullets */}
        {item.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
            {item.description}
          </p>
        )}
        {item.bullets && (
          <ul className="space-y-1.5">
            {item.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-2)' }}>
                <span className="mt-1.5 flex-shrink-0 w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="py-24">
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
            Journey
            <span className="inline-block w-8 h-px" style={{ background: 'var(--accent)' }} />
          </span>
          <h2
            className="font-display font-extrabold text-3xl lg:text-4xl"
            style={{ color: 'var(--text)' }}
          >
            Experience &amp; Education
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Work Experience */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="section-label mb-8 flex items-center gap-2"
            >
              <span className="inline-block w-4 h-px" style={{ background: 'var(--accent)' }} />
              Work Experience
            </motion.h3>
            <div className="relative">
              {EXPERIENCE.map((item, i) => (
                <TimelineCard
                  key={`${item.title}-${i}`}
                  item={item}
                  index={i}
                  isLast={i === EXPERIENCE.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="section-label mb-8 flex items-center gap-2"
            >
              <span className="inline-block w-4 h-px" style={{ background: 'var(--accent)' }} />
              Education
            </motion.h3>
            <div className="relative">
              {EDUCATION.map((item, i) => (
                <TimelineCard
                  key={`${item.title}-${i}`}
                  item={item}
                  index={i}
                  isLast={i === EDUCATION.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
