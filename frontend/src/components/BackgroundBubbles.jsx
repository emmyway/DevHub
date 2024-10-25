import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const BackgroundBubbles = ({ count = 40 }) => {
  const bubbles = useMemo(() => {
    return [...Array(count)].map((_, i) => {
      const size = Math.random() * 70 + 10; // Ensure size is between 10 and 50
      return {
        key: i,
        style: {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
        },
        animate: {
          y: [0, Math.random() * 100 - 50],
          x: [0, Math.random() * 100 - 50],
        },
        transition: {
          duration: Math.random() * 7 + 3, // Reduced duration for increased speed
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        },
      };
    });
  }, [count]);

  return (
    <div className="absolute inset-0">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.key}
          className="absolute rounded-full bg-blue-500 opacity-5"
          style={bubble.style}
          animate={bubble.animate}
          transition={bubble.transition}
        />
      ))}
    </div>
  );
};

BackgroundBubbles.propTypes = {
  count: PropTypes.number,
};

export default React.memo(BackgroundBubbles);
