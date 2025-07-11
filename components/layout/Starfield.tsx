'use client';
import { CSSProperties } from 'react';

const STAR_COUNT = 50;

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function Starfield() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {Array.from({ length: STAR_COUNT }).map((_, i) => {
        const delay = randomRange(0, 5);
        const duration = randomRange(8, 12);
        const top = randomRange(0, 100);
        const style: CSSProperties = {
          top: `${top}%`,
          animationDelay: `${delay}s, ${delay}s`,
          animationDuration: `${duration}s, ${duration}s`,
        };
        return <div key={i} className="star" style={style} />;
      })}
      <style jsx>{`
        .star {
          position: absolute;
          left: 0;
          width: 6em;
          height: 2px;
          color: var(--color-cloud-100); /* replaced hex with cloud-100 token */
          background: linear-gradient(45deg, currentColor, transparent);
          border-radius: 50%;
          filter: drop-shadow(0 0 6px currentColor);
          transform: translate3d(104em, 0, 0);
          animation-name: fall, tail-fade;
          animation-timing-function: linear, ease-out;
          animation-iteration-count: infinite;
        }
        @keyframes fall {
          to {
            transform: translate3d(-30em, 0, 0);
          }
        }
        @keyframes tail-fade {
          0%, 70% {
            width: 6em;
            opacity: 1;
          }
          100% {
            width: 0;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
