"use client";

import { useState, useEffect, useRef } from "react";

interface QuizTimer {
  secondsLeft: number;
  isUrgent: boolean;
  isCritical: boolean;
  isExpired: boolean;
}

export function useQuizTimer(durationSeconds: number, enabled: boolean): QuizTimer {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const prevEnabled = useRef(false);

  // Reset when enabled transitions to true
  useEffect(() => {
    if (enabled && !prevEnabled.current) {
      setSecondsLeft(durationSeconds);
    }
    prevEnabled.current = enabled;
  }, [enabled, durationSeconds]);

  // Countdown interval
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  return {
    secondsLeft,
    isUrgent: secondsLeft <= Math.ceil(durationSeconds * 0.25),
    isCritical: secondsLeft <= Math.ceil(durationSeconds * 0.1),
    isExpired: secondsLeft <= 0,
  };
}
