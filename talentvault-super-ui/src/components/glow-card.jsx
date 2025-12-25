'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GlowCard({ children, className }) {
  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.35)]',
        'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(247,198,106,0.35),_transparent_55%)]',
        'after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_bottom,_rgba(95,166,160,0.25),_transparent_60%)]',
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
