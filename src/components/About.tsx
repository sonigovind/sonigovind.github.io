'use client';

import { motion } from 'framer-motion';
import { BIO, SKILLS } from '@/data';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function About() {
  return (
    <section id="about" className="py-24 section-alt">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_340px] gap-16 items-start">

          {/* ── Left: bio ───────────────────────────────────────── */}
          <div>
            <motion.div {...fadeUp(0)}>
              <span className="section-label flex items-center gap-2 mb-5">
                <span className="inline-block w-6 h-px" style={{ background: 'var(--accent)' }} />
                About
              </span>
              <h2
                className="font-display font-bold text-3xl lg:text-4xl mb-8 leading-tight"
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
                  {...fadeUp(0.1 + i * 0.08)}
                  className="leading-relaxed text-sm"
                  style={{ color: 'var(--text-2)', lineHeight: '1.75' }}
                  dangerouslySetInnerHTML={{ __html: para }}
                />
              ))}
            </div>
          </div>

          {/* ── Right: expertise + qualifications ───────────────── */}
          <div className="space-y-7 lg:pt-[68px]">

            {/* Technical expertise as clean text sections */}
            {SKILLS.map((cat, i) => (
              <motion.div
                key={cat.label}
                {...fadeUp(0.15 + i * 0.1)}
              >
                <p
                  className="text-xs font-medium mb-2"
                  style={{
                    color: 'var(--accent)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-jetbrains)',
                  }}
                >
                  {cat.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  {cat.skills.join(' · ')}
                </p>
                {i < SKILLS.length - 1 && (
                  <div className="mt-5 divider-line" />
                )}
              </motion.div>
            ))}

            <div className="divider-line" />

            {/* Qualifications */}
            <motion.div {...fadeUp(0.15 + SKILLS.length * 0.1)}>
              <p
                className="text-xs font-medium mb-3"
                style={{
                  color: 'var(--accent)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-jetbrains)',
                }}
              >
                Qualifications
              </p>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-2)', lineHeight: '1.7' }}>
                <p>PhD CS · IIT Bombay · CPI 8.33</p>
                <p>M.Tech Data Science · JNU Delhi · 87.4%</p>
                <p>GATE Qualified (2020, 2021, 2024)</p>
                <p>UGC NET Qualified (2023)</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
