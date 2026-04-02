'use client';

import { motion } from 'framer-motion';

type Props = { className?: string };

export default function AnimationSlideUp({ className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
