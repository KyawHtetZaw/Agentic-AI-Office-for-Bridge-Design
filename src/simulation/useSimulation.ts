import { useEffect, useReducer } from 'react';
import { createSimulation, reduceSimulation } from './engine.ts';

export function useSimulation(paused: boolean, speed: number) {
  const [simulation, dispatch] = useReducer(reduceSimulation, undefined, () => createSimulation(Date.now() >>> 0));
  useEffect(() => {
    if (paused) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      // A backgrounded browser does not fast-forward the whole project on return.
      const dt = Math.min((now - previous) / 1000, .15) * speed;
      previous = now;
      dispatch({ type: 'tick', dt });
    }, 100);
    return () => window.clearInterval(timer);
  }, [paused, speed]);
  return { simulation, dispatch };
}
