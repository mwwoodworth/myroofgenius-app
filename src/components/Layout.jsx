import React from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Footer from './Footer';
import { ThemeProvider } from '../context/ThemeContext';

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen font-sans bg-white text-[#202940] dark:bg-[#202940] dark:text-gray-100">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
