'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Mail, ChevronDown } from 'lucide-react';
import { SITE_CONFIG, STATS, RESEARCH_INTERESTS } from '@/data';
import AnimatedCounter from './AnimatedCounter';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-16 overflow-hidden hero-mesh"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full animate-float-a"
          style={{
            width: 600,
            height: 600,
            top: '-10%',
            right: '-15%',
            background: 'radial-gradient(circle, rgba(240,180,41,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute rounded-full animate-float-b"
          style={{
            width: 500,
            height: 500,
            bottom: '-5%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute rounded-full animate-float-c"
          style={{
            width: 400,
            height: 400,
            top: '40%',
            left: '40%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Decorative rings */}
        <div
          className="absolute rounded-full"
          style={{
            width: 700,
            height: 700,
            top: '5%',
            right: '-20%',
            border: '1px solid rgba(240,180,41,0.04)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            top: '15%',
            right: '-12%',
            border: '1px solid rgba(240,180,41,0.06)',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-24 relative z-10 w-full">
        <div className="grid lg:grid-cols-[1fr_auto] gap-16 items-center">
          {/* Left — Text Content */}
          <div className="max-w-2xl">
            {/* Label row */}
            <motion.div {...fadeUp(0.1)} className="flex items-center gap-3 mb-8">
              <div
                className="w-2 h-2 rounded-full animate-pulse-slow"
                style={{ background: 'var(--accent)' }}
              />
              <span className="section-label">Research Scholar</span>
              <span style={{ color: 'var(--text-3)', fontSize: '0.7rem' }}>·</span>
              <span
                className="text-xs px-3 py-1 rounded-full font-mono"
                style={{
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--border-hover)',
                  color: 'var(--accent)',
                }}
              >
                IIT Bombay
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              {...fadeUp(0.2)}
              className="font-display font-extrabold leading-[1.05] mb-6"
              style={{
                fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                color: 'var(--text)',
              }}
            >
              Govind Kumar{' '}
              <span className="text-gradient block sm:inline">Soni</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              {...fadeUp(0.3)}
              className="text-lg mb-6"
              style={{ color: 'var(--text-2)', fontWeight: 400 }}
            >
              PhD Researcher &nbsp;·&nbsp; Multimodal Code Generation &nbsp;·&nbsp; NLP
            </motion.p>

            {/* Research snapshot */}
            <motion.div
              {...fadeUp(0.4)}
              className="p-5 rounded-xl mb-10"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--accent)',
              }}
            >
              <p className="section-label mb-2">Research Snapshot</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                I develop AI systems that understand and generate code from multiple input
                modalities — combining vision, language, and structured data to automate software
                tasks. My broader work spans neural machine translation for low-resource languages.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div {...fadeUp(0.5)} className="flex flex-wrap gap-3 mb-10">
              <a href="#publications" className="btn-primary">
                View Publications
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#contact" className="btn-secondary">
                <Mail className="w-4 h-4" />
                Get in Touch
              </a>
            </motion.div>

            {/* Research interest pills */}
            <motion.div {...fadeUp(0.6)} className="flex flex-wrap gap-2">
              {RESEARCH_INTERESTS.map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — Profile + Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="flex flex-col items-center gap-8"
          >
            {/* Profile Photo */}
            <div className="relative">
              {/* Animated outer ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, var(--accent), transparent, var(--accent-light), transparent, var(--accent))',
                  padding: 2,
                  borderRadius: '50%',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <div
                className="relative w-52 h-52 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  background: 'var(--bg-2)',
                  border: '4px solid var(--bg)',
                  zIndex: 1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/profile.jpeg"
                  alt={SITE_CONFIG.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <span
                  className="font-display font-bold text-5xl hidden items-center justify-center"
                  style={{ color: 'var(--accent)' }}
                >
                  GS
                </span>
              </div>

              {/* Floating badges */}
              <motion.div
                className="absolute -right-4 top-4 px-3 py-1.5 rounded-lg text-xs font-mono shadow-lg"
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border-hover)',
                  color: 'var(--accent)',
                }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                IIT Bombay
              </motion.div>
              <motion.div
                className="absolute -left-4 bottom-8 px-3 py-1.5 rounded-lg text-xs font-mono shadow-lg"
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-2)',
                }}
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                PhD · CS
              </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {STATS.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="card-base p-4 text-center"
                  whileHover={{ scale: 1.03 }}
                >
                  <p
                    className="font-display font-bold text-2xl mb-1"
                    style={{ color: 'var(--accent)' }}
                  >
                    <AnimatedCounter
                      value={stat.value}
                      decimals={stat.decimals}
                      suffix={stat.suffix}
                    />
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'var(--text-3)' }}
      >
        <span className="section-label" style={{ fontSize: '0.6rem' }}>
          scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
