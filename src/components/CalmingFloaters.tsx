import { motion } from 'motion/react';

interface CalmOrb {
  id: number;
  className: string;
  duration: number;
  dx: number;
  dy: number;
}

const CALM_ORBS: CalmOrb[] = [
  {
    id: 1,
    className:
      'top-[6%] left-[4%] w-52 h-52 rounded-full bg-[#92D5FF]/35 blur-2xl',
    duration: 16,
    dx: 24,
    dy: 18,
  },
  {
    id: 2,
    className:
      'top-[14%] right-[5%] w-64 h-64 rounded-full bg-[#B5A4FF]/30 blur-2xl',
    duration: 19,
    dx: -26,
    dy: 20,
  },
  {
    id: 3,
    className:
      'bottom-[10%] left-[8%] w-60 h-60 rounded-full bg-[#FFF59D]/40 blur-2xl',
    duration: 18,
    dx: 20,
    dy: -22,
  },
  {
    id: 4,
    className:
      'bottom-[8%] right-[7%] w-56 h-56 rounded-full bg-[#FFD2DD]/40 blur-2xl',
    duration: 21,
    dx: -22,
    dy: -16,
  },
];

export function CalmingFloaters() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {CALM_ORBS.map((orb) => (
        <motion.div
          key={orb.id}
          className={`motion-floater absolute ${orb.className}`}
          animate={{
            x: [0, orb.dx, 0],
            y: [0, orb.dy, 0],
            scale: [1, 1.07, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
