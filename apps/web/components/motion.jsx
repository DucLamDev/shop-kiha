'use client';
import { motion, MotionConfig } from 'motion/react';
import { useExperienceMotion } from '@/components/home-experience';
export function Reveal({ children, className = '', delay = 0 }) {
  const { enabled } = useExperienceMotion();
  return (
    <MotionConfig reducedMotion={enabled ? 'user' : 'always'}>
      <motion.div
        initial={{ y: 28 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{
          duration: enabled ? 0.8 : 0,
          delay: enabled ? delay : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
