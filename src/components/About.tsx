'use client';

import { motion } from 'framer-motion';
import { BIO, SKILLS } from '@/data';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function About() {
  return (
    <section id="about" className="py-24 section-alt">
      <div className="max-w-5xl mx-auto px-6">

        {/* Section header — left-aligned, document style */}
        <motion.div {...fadeUp(0)} className="mb-12">
          <h2
            className="font-display font-bold text-2xl lg:text-3xl mb-3"
            style={{ color: 'var(--text)' }}
          >
            About
          </h2>
          <div className="h-px w-16" style={{ background: 'var(--accent)' }} />
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-14 items-start">

          {/* ── Left: bio continuation ───────────────────────── */}
          <div className="space-y-4">
            {/* Show all bio paragraphs — first was shown in hero, rest here */}
            {BIO.slice(1).map((para, i) => (
              <motion.p
                key={i}
                {...fadeUp(0.08 + i * 0.08)}
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-2)', lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: para }}
              />
            ))}

            {/* Qualifications inline */}
            <motion.div
              {...fadeUp(0.24)}
              className="mt-6 p-5 rounded-xl"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <p
                className="text-xs font-semibold mb-3 tracking-wider uppercase"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-jetbrains)' }}
              >
                Education
              </p>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-2)', lineHeight: '1.7' }}>
                <p><span style={{ color: 'var(--text)', fontWeight: 500 }}>PhD, Computer Science</span> · IIT Bombay · CPI 8.33 · 2023–present</p>
                <p><span style={{ color: 'var(--text)', fontWeight: 500 }}>M.Tech, Data Science</span> · JNU Delhi · 87.4% · 2020–2022</p>
                <p><span style={{ color: 'var(--text)', fontWeight: 500 }}>B.Tech, CSE</span> · Rajasthan Technical University</p>
                <p className="pt-1" style={{ color: 'var(--text-3)' }}>GATE Qualified (2020, 2021, 2024) · UGC NET (2023)</p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: expertise ─────────────────────────────── */}
          <div className="space-y-6">
            {SKILLS.map((cat, i) => (
              <motion.div key={cat.label} {...fadeUp(0.1 + i * 0.08)}>
                <p
                  className="text-xs font-semibold mb-2 tracking-wider uppercase"
                  style={{ color: 'var(--accent)', fontFamily: 'var(--font-jetbrains)' }}
                >
                  {cat.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  {cat.skills.join(' · ')}
                </p>
                {i < SKILLS.length - 1 && (
                  <div className="mt-5" style={{ height: '1px', background: 'var(--border)' }} />
                )}
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
