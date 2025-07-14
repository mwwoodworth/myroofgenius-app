import React from 'react';

interface StarfieldBackgroundProps {
  className?: string;
}

/**
 * Simple CSS starfield background for header (desktop only).
 * Uses styled-jsx so no extra CSS file is needed.
 */
const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`w-full h-full ${className}`} aria-hidden="true">
      <div className="starfield w-full h-full" />
      <style jsx>{`
        .starfield {
          background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .starfield::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 200%;
          background-image:
            radial-gradient(2px 2px at 20px 30px, #fff, transparent),
            radial-gradient(2px 2px at 80px 120px, #fff, transparent),
            radial-gradient(2px 2px at 130px 80px, #fff, transparent),
            radial-gradient(2px 2px at 200px 50px, #fff, transparent),
            radial-gradient(2px 2px at 300px 150px, #fff, transparent);
          animation: starMove 60s linear infinite;
        }
        @keyframes starMove {
          from {
            transform: translate3d(0px, 0px, 0);
          }
          to {
            transform: translate3d(-50%, -50%, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default StarfieldBackground;
