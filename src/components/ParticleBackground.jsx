import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const ParticleBackground = ({ mousePosition }) => {
  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 10 + 5,
            height: Math.random() * 10 + 5,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 100 * mousePosition.x],
            y: [0, (Math.random() - 0.5) * 100 * mousePosition.y],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </Box>
  );
};

export default ParticleBackground;
