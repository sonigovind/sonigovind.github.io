'use client';

import { motion } from 'framer-motion';
import { Mail, Linkedin, BookOpen, Github, ArrowUpRight } from 'lucide-react';
import { SITE_CONFIG } from '@/data';

const CONTACTS = [
  {
    label: 'Email',
    value: SITE_CONFIG.email,
    href: `mailto:${SITE_CONFIG.email}`,
    icon: <Mail className="w-4 h-4" />,
    external: false,
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/sonigovind07',
    href: SITE_CONFIG.linkedin,
    icon: <Linkedin className="w-4 h-4" />,
    external: true,
  },
  {
    label: 'Google Scholar',
    value: 'View my citations',
    href: SITE_CONFIG.scholar,
    icon: <BookOpen className="w-4 h-4" />,
    external: true,
  },
  {
    label: 'GitHub',
    value: 'github.com/sonigovind',
    href: SITE_CONFIG.github,
    icon: <Github className="w-4 h-4" />,
    external: true,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-24 section-alt">
      <div className="max-w-6xl mx-auto px-6">
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
            Contact
          </h2>
          <div className="h-px w-16 mb-4" style={{ background: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Open to research collaborations, academic discussions, and opportunities in NLP and multilingual AI.
          </p>
        </motion.div>

        <div className="max-w-xl mx-auto space-y-3">
          {CONTACTS.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              target={c.external ? '_blank' : undefined}
              rel={c.external ? 'noopener noreferrer' : undefined}
              className="contact-link"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
              whileHover={{ x: 4 }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--border-hover)',
                  color: 'var(--accent)',
                }}
              >
                {c.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono mb-0.5" style={{ color: 'var(--text-3)' }}>
                  {c.label}
                </p>
                <p className="text-sm truncate" style={{ color: 'var(--text)' }}>
                  {c.value}
                </p>
              </div>

              <ArrowUpRight
                className="w-4 h-4 flex-shrink-0 transition-opacity"
                style={{ color: 'var(--text-3)' }}
              />
            </motion.a>
          ))}
        </div>

        {/* Open to opportunities banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
          className="max-w-xl mx-auto mt-8 p-5 rounded-xl text-center"
          style={{
            background: 'var(--accent-subtle)',
            border: '1px solid var(--border-hover)',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--accent)' }}
            />
            <span
              className="section-label"
              style={{ fontSize: '0.65rem' }}
            >
              Open to Collaboration
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-2)' }}>
            Research collaborations · Academic discussions · Industry partnerships
          </p>
        </motion.div>
      </div>
    </section>
  );
}
