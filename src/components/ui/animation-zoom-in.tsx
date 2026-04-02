'use client';

import { motion } from 'framer-motion';

type Props = { className?: string };

export default function AnimationZoomIn({ className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
