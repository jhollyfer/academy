"use client";

import { useEffect, useRef } from "react";

export function useUrgencySound(shouldPlay: boolean, secondsLeft: number, isCritical: boolean = secondsLeft <= 5) {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!shouldPlay) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Create or resume AudioContext
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    function beep() {
      if (!ctxRef.current) return;
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      osc.start(now);
      osc.stop(now + 0.1);
    }

    // Set interval based on urgency level — first beep after interval (no immediate double-beep)
    const ms = isCritical ? 1000 : 2000;
    beep();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(beep, ms);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldPlay, isCritical]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, []);
}
