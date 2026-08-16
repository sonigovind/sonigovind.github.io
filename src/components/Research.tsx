'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Languages, FileSearch, Smile, Cpu, Globe, Radar, ExternalLink } from 'lucide-react';
import { RESEARCH_AREAS } from '@/data';

const ICONS: Record<string, React.ReactNode> = {
  code: <Code2 className="w-5 h-5" />,
  translate: <Languages className="w-5 h-5" />,
  entity: <FileSearch className="w-5 h-5" />,
  sentiment: <Smile className="w-5 h-5" />,
  transformer: <Cpu className="w-5 h-5" />,
  multilingual: <Globe className="w-5 h-5" />,
};

type RadarItem = {
  date: string;
  area: string;
  title: string;
  authors: string[];
  institutions: string[];
  venue: string;
  score: number;
  citations: number;
  why: string;
  url: string;
};

type RadarData = {
  generated_at: string;
  window_days: number;
  items: RadarItem[];
  counts: Record<string, number>;
  watch: { researchers: number; institutions: string[]; venues: string[] };
};

export default function Research() {
  const [radar, setRadar] = useState<RadarData | null>(null);

  useEffect(() => {
    fetch('/research-radar.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setRadar)
      .catch(() => setRadar(null));
  }, []);

  return (
    <>
      <section id="research" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-display font-bold text-2xl lg:text-3xl mb-3" style={{ color: 'var(--text)' }}>
              Research Areas
            </h2>
            <div className="h-px w-16 mb-4" style={{ background: 'var(--accent)' }} />
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              Active directions spanning multimodal code generation, agentic software engineering,
              mechanistic interpretability, and explainable AI.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {RESEARCH_AREAS.map((area, i) => (
              <motion.article
                key={area.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="card-base p-6 group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'var(--accent-subtle)', border: '1px solid var(--border-hover)', color: 'var(--accent)' }}
                >
                  {ICONS[area.iconKey]}
                </div>
                <h3 className="font-display font-semibold text-base mb-3" style={{ color: 'var(--text)' }}>
                  {area.title}
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-2)' }}>
                  {area.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {area.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full"
                      style={{ background: 'var(--border)', color: 'var(--text-3)', fontSize: '0.65rem' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="radar" className="py-24" style={{ background: 'var(--bg-1)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--accent)' }}>
                <Radar className="w-5 h-5" />
                <span className="font-mono text-xs uppercase tracking-wider">Automated weekly tracker</span>
              </div>
              <h2 className="font-display font-bold text-2xl lg:text-3xl mb-3" style={{ color: 'var(--text)' }}>
                Research Radar
              </h2>
              <p className="text-sm max-w-2xl" style={{ color: 'var(--text-2)' }}>
                High-priority recent papers across multimodal code generation, agentic software engineering,
                mechanistic interpretability, and explainable AI. Priority is boosted for watched venues,
                institutions, researchers, and stronger causal/evaluation signals.
              </p>
            </div>
            {radar && (
              <div className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
                Updated {new Date(radar.generated_at).toLocaleDateString()}
              </div>
            )}
          </div>

          {!radar ? (
            <div className="card-base p-6 text-sm" style={{ color: 'var(--text-2)' }}>
              Research radar data will appear after the first automated GitHub Pages update.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {Object.entries(radar.counts).map(([area, count]) => (
                  <div key={area} className="card-base p-4">
                    <div className="text-2xl font-display font-bold" style={{ color: 'var(--accent)' }}>{count}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{area}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {radar.items.slice(0, 12).map((item) => (
                  <article key={`${item.title}-${item.date}`} className="card-base p-5">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                            {item.area}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-3)' }}>{item.venue}</span>
                          <span className="text-xs" style={{ color: 'var(--text-3)' }}>{item.date}</span>
                        </div>
                        <h3 className="font-display font-semibold text-base leading-snug mb-2" style={{ color: 'var(--text)' }}>
                          {item.title}
                        </h3>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-2)' }}>
                          {item.authors.slice(0, 4).join(', ')}{item.authors.length > 4 ? ' et al.' : ''}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {item.why}
                        </p>
                      </div>
                      <div className="flex md:flex-col items-center md:items-end gap-3 flex-shrink-0">
                        <div className="text-center md:text-right">
                          <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{item.score}</div>
                          <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>priority</div>
                        </div>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs"
                            style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                            Paper <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 text-xs" style={{ color: 'var(--text-3)' }}>
                Watching {radar.watch.researchers} selected researchers and major ML, NLP, vision, and software-engineering venues.
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
