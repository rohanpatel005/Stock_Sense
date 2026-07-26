import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

const Counter = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000; // 2 seconds animation
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * target);
      
      setCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-display-lg font-bold text-primary mb-2">
      {count.toLocaleString()}{suffix}
    </div>
  );
};

const Stats = () => {
  return (
    <section className="py-24 px-gutter">
      <div className="max-w-container-max mx-auto text-center">
        <div>
          <Counter target={95} suffix="%" />
          <div className="text-label-caps font-bold text-on-surface-variant">PREDICTION ACCURACY</div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
