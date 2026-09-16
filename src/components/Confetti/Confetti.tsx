import { useEffect, useState } from 'react';
import styles from './Confetti.module.scss';

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

const COLORS = ['#ffd54f', '#ff6b9d', '#7c6cf0', '#4dd0a8', '#ff8a65', '#64b5f6', '#fff176'];

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 2,
      size: 6 + Math.random() * 8,
      drift: -30 + Math.random() * 60,
    }));
    setParticles(items);
  }, []);

  return (
    <div className={styles.confetti} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
