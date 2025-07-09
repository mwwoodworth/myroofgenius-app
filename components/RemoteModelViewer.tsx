'use client';
import { useEffect } from 'react';

interface RemoteModelViewerProps {
  src: string;
  iosSrc?: string;
  alt?: string;
  ar?: boolean;
  className?: string;
}

export default function RemoteModelViewer({ src, iosSrc, alt, ar = true, className = '' }: RemoteModelViewerProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <model-viewer
      src={src}
      ios-src={iosSrc}
      ar={ar}
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
      className={className}
      style={{ width: '100%', height: '100%' }}
    >
      <div slot="fallback" className="flex items-center justify-center w-full h-full bg-gray-200">Loading 3D model...</div>
    </model-viewer>
  );
}
