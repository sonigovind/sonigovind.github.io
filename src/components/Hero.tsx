'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, Github, Linkedin, BookOpen, ChevronDown, FileText } from 'lucide-react';
import { SITE_CONFIG, RESEARCH_INTERESTS, BIO } from '@/data';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const SOCIAL = [
  { label: 'Email', href: `mailto:${SITE_CONFIG.email}`, Icon: Mail },
  { label: 'GitHub', href: SITE_CONFIG.github, Icon: Github },
  { label: 'Google Scholar', href: SITE_CONFIG.scholar, Icon: BookOpen },
  { label: 'LinkedIn', href: SITE_CONFIG.linkedin, Icon: Linkedin },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
    >
      {/* Clean, very subtle top gradient — no blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -10%, var(--accent-subtle) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-5xl mx-auto px-6 py-16 lg:py-24 relative z-10 w-full">
        {/* ── Responsive wrapper ─────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* ── Left: photo card (Hugo Academic style) ─────────── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="flex flex-row lg:flex-col items-center gap-6 w-full lg:w-auto lg:min-w-[190px]"
          >
            {/* Circular photo with accent ring */}
            <div
              className="flex-shrink-0"
              style={{
                borderRadius: '50%',
                padding: '4px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                boxShadow: '0 8px 32px var(--accent-subtle)',
              }}
            >
              <div
                className="w-32 h-32 lg:w-44 lg:h-44 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-2)', border: '3px solid var(--bg)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/profile.jpeg"
                  alt={SITE_CONFIG.name}
                  className="w-full h-full object-cover block"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.style.display = 'none';
                    const fb = img.nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = 'flex';
                  }}
                />
                <div
                  className="w-full h-full hidden items-center justify-center font-display font-bold text-3xl"
                  style={{ color: 'var(--accent)' }}
                >
                  GS
                </div>
              </div>
            </div>

            {/* Name + institution + social */}
            <div className="flex flex-col items-start lg:items-center gap-3 lg:text-center">
              <div>
                <p
                  className="font-display font-semibold text-base leading-snug"
                  style={{ color: 'var(--text)' }}
                >
                  Govind Kumar Soni
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--text-3)', fontFamily: 'var(--font-jetbrains)' }}
                >
                  IIT Bombay · CSE
                </p>
              </div>

              {/* Social icon row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {SOCIAL.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    title={label}
                    target={href.startsWith('mailto') ? undefined : '_blank'}
                    rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    className="social-icon-btn"
                    aria-label={label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Right: content ──────────────────────────────────── */}
          <div className="flex-1 max-w-2xl">
            {/* Role label */}
            <motion.div {...fadeUp(0.1)} className="flex items-center gap-2 mb-5">
              <span
                className="inline-block w-5 h-px flex-shrink-0"
                style={{ background: 'var(--accent)' }}
              />
              <span
                className="text-xs font-medium tracking-widest uppercase"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-jetbrains)' }}
              >
                PhD Research Scholar
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.18)}
              className="font-display font-bold leading-tight mb-5"
              style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3rem)', color: 'var(--text)' }}
            >
              Multimodal Code Generation<br className="hidden sm:block" />
              &amp; Natural Language Processing
            </motion.h1>

            {/* Bio intro */}
            <motion.div
              {...fadeUp(0.26)}
              className="text-sm leading-relaxed mb-7"
              style={{ color: 'var(--text-2)', maxWidth: '56ch', lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ __html: BIO[0] }}
            />

            {/* Research interest chips */}
            <motion.div {...fadeUp(0.33)} className="mb-8">
              <p
                className="text-xs font-medium mb-2.5 tracking-wider uppercase"
                style={{ color: 'var(--text-3)', fontFamily: 'var(--font-jetbrains)' }}
              >
                Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {RESEARCH_INTERESTS.map((tag) => (
                  <span key={tag} className="interest-chip">{tag}</span>
                ))}
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div {...fadeUp(0.4)} className="flex flex-wrap gap-3">
              <a href="#publications" className="btn-primary">
                Publications
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#about" className="btn-secondary">
                <FileText className="w-4 h-4" />
                About Me
              </a>
              <a href="#contact" className="btn-secondary">
                <Mail className="w-4 h-4" />
                Contact
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        style={{ color: 'var(--text-3)' }}
      >
        <span
          style={{
            fontSize: '0.58rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-jetbrains)',
          }}
        >
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
