'use client';

import { motion } from 'framer-motion';
import { BIO, SKILLS } from '@/data';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

export default function About() {
  return (
    <section id="about" className="py-24 section-alt">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — Bio */}
          <div>
            <motion.div {...fadeInUp}>
              <span className="section-label flex items-center gap-2 mb-4">
                <span
                  className="inline-block w-8 h-px"
                  style={{ background: 'var(--accent)' }}
                />
                About
              </span>
              <h2
                className="font-display font-extrabold text-3xl lg:text-4xl mb-8 leading-tight"
                style={{ color: 'var(--text)' }}
              >
                Advancing Language AI<br />
                for Underserved Communities
              </h2>
            </motion.div>

            <div className="space-y-4">
              {BIO.map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
                  className="leading-relaxed text-sm"
                  style={{ color: 'var(--text-2)' }}
                  dangerouslySetInnerHTML={{ __html: para }}
                />
              ))}
            </div>

          </div>

          {/* Right — Skills */}
          <div className="space-y-5">
            {SKILLS.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const }}
                className="card-base p-5"
              >
                <p
                  className="text-xs mb-3 font-mono"
                  style={{ color: 'var(--text-3)', letterSpacing: '0.06em' }}
                >
                  {cat.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      className="pill"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Education quick stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { val: '8.33', label: 'PhD CPI' },
                { val: '87.4%', label: 'M.Tech Agg.' },
                { val: 'GATE ✓', label: 'Qualified' },
              ].map(({ val, label }) => (
                <div
                  key={label}
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p
                    className="font-display font-bold text-lg"
                    style={{ color: 'var(--accent)' }}
                  >
                    {val}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
