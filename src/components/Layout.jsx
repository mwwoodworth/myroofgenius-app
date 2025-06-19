import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { CopilotPopup, CopilotChat } from '@copilotkit/react-ui';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#f4f7fa] text-[#202940]">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CopilotPopup>
        <CopilotChat />
      </CopilotPopup>
    </div>
  );
}
