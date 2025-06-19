import '../app/globals.css';
import React from 'react';
import Layout from '../src/components/Layout';

export const metadata = {
  title: 'MyRoofGenius',
  description: 'Public SaaS React + FastAPI system for MyRoofGenius.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
