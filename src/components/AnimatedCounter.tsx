'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

type Props = {
  value: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
};

export default function AnimatedCounter({ value, decimals = 0, suffix = '', duration = 1800 }: Props) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    const start = performance.now();
    const from = 0;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = from + (value - from) * ease;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [inView, value, decimals, duration]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}
