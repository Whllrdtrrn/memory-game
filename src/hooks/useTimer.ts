import { useState, useRef, useEffect, useCallback } from 'react';

export function useTimer(isRunning: boolean) {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const reset = useCallback(() => {
    setTime(0);
  }, []);

  const setTo = useCallback((t: number) => {
    setTime(t);
  }, []);

  return { time, reset, setTo };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
