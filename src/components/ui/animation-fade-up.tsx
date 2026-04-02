'use client';

import { motion } from 'framer-motion';

type Props = { className?: string };

export default function AnimationFadeUp({ className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
