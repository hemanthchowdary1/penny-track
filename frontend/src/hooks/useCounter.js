import { useState, useEffect, useRef } from "react";

export default function useCounter(target, duration = 900) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const diff  = target - start;
    if (diff === 0) return;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(start + diff * e));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return val;
}