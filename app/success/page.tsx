'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';

export default function Success() {
  const [downloads, setDownloads] = useState<Array<{ file_name: string, download_url: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    async function fetchDownloads() {
      if (!sessionId) {
        setMessage('No order session found.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/order/${sessionId}`);
        if (!res.ok) {
          setMessage('Your order is confirmed. Please check your email for the download links.');
        } else {
          const data = await res.json();
          setDownloads(data.downloads || []);
        }
      } catch (error) {
        console.error('Failed to fetch downloads:', error);
        setMessage('An error occurred retrieving your downloads. Please check your email for the files.');
      } finally {
        setLoading(false);
      }
    }
    fetchDownloads();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">Order Confirmed</h1>
        <p className="text-lg text-gray-700 mb-6">Download Your Files</p>

        {loading ? (
          <p className="text-gray-600">Retrieving your files...</p>
        ) : (
          <>
            {downloads.length > 0 ? (
              <div className="space-y-4">
                {downloads.map((file, idx) => (
                  <div key={idx}>
                    <a href={file.download_url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {file.file_name || `File ${idx + 1}`}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">{message}</p>
            )}
          </>
        )}

        <div className="mt-8">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
