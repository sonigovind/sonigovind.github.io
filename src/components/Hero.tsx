'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, Github, Linkedin, BookOpen, ChevronDown } from 'lucide-react';
import { SITE_CONFIG, RESEARCH_INTERESTS } from '@/data';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const SOCIAL_LINKS = [
  { label: 'Email', href: `mailto:${SITE_CONFIG.email}`, Icon: Mail },
  { label: 'GitHub', href: SITE_CONFIG.github, Icon: Github },
  { label: 'Scholar', href: SITE_CONFIG.scholar, Icon: BookOpen },
  { label: 'LinkedIn', href: SITE_CONFIG.linkedin, Icon: Linkedin },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden hero-bg"
    >
      <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28 relative z-10 w-full">
        <div className="grid lg:grid-cols-[1fr_240px] gap-14 items-start">

          {/* ── Left: text ──────────────────────────────────────── */}
          <div className="max-w-xl">

            {/* Affiliation */}
            <motion.div {...fadeUp(0.1)} className="flex items-center gap-2.5 mb-7">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--accent)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-jetbrains)' }}>
                IIT Bombay · Department of Computer Science &amp; Engineering
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              {...fadeUp(0.18)}
              className="font-display font-bold leading-[1.1] mb-4"
              style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', color: 'var(--text)' }}
            >
              Govind Kumar Soni
            </motion.h1>

            {/* Title */}
            <motion.p
              {...fadeUp(0.26)}
              className="text-base mb-8 font-medium"
              style={{ color: 'var(--text-2)' }}
            >
              PhD Research Scholar &nbsp;·&nbsp; Multimodal Code Generation &nbsp;·&nbsp; NLP
            </motion.p>

            {/* Research statement */}
            <motion.p
              {...fadeUp(0.32)}
              className="leading-relaxed mb-8"
              style={{ color: 'var(--text-2)', fontSize: '0.94rem', maxWidth: '46ch' }}
            >
              I develop AI systems that understand and generate code from multiple input
              modalities — combining natural language, visual diagrams, and structured
              data to automate software tasks. My broader work spans neural machine
              translation for low-resource languages.
            </motion.p>

            {/* Research interest tags */}
            <motion.div {...fadeUp(0.38)} className="flex flex-wrap gap-2 mb-10">
              {RESEARCH_INTERESTS.map((tag) => (
                <span key={tag} className="pill">{tag}</span>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div {...fadeUp(0.44)} className="flex flex-wrap gap-3">
              <a href="#publications" className="btn-primary">
                Publications
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#contact" className="btn-secondary">
                <Mail className="w-4 h-4" />
                Get in Touch
              </a>
            </motion.div>
          </div>

          {/* ── Right: profile (desktop only) ───────────────────── */}
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="hidden lg:flex flex-col gap-3"
          >
            {/* Photo */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--bg-2)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profile.jpeg"
                alt={SITE_CONFIG.name}
                className="w-full aspect-square object-cover block"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                  const fallback = img.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div
                className="w-full aspect-square hidden items-center justify-center font-display font-bold text-4xl"
                style={{ color: 'var(--accent)', background: 'var(--bg-2)' }}
              >
                GS
              </div>
            </div>

            {/* Mobile-friendly name below photo */}
            <p
              className="text-xs text-center font-medium"
              style={{ color: 'var(--text-3)', fontFamily: 'var(--font-jetbrains)' }}
            >
              {SITE_CONFIG.name}
            </p>

            {/* Social links */}
            <div className="grid grid-cols-2 gap-1.5">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium"
                  style={{
                    background: 'var(--bg-1)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-3)',
                    textDecoration: 'none',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'var(--border-hover)';
                    el.style.color = 'var(--accent)';
                    el.style.background = 'var(--accent-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'var(--border)';
                    el.style.color = 'var(--text-3)';
                    el.style.background = 'var(--bg-1)';
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </a>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        style={{ color: 'var(--text-3)' }}
      >
        <span style={{ fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'var(--font-jetbrains)' }}>
          scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
