import React from 'react';

const Home = () => {
  return (
    <section className="bg-[#f5f7fa]">
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#202940] mb-4">
          Smarter Roofing Starts Here
        </h1>
        <p className="text-lg md:text-2xl text-gray-600 mb-8">
          Discover AI-powered tools, expert guides, and the industry’s best resources—all in one place.
        </p>
        <a
          href="/marketplace"
          className="inline-block bg-[#2366d1] hover:bg-[#1e59b8] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition">
          Browse Marketplace
        </a>
      </div>
      <img
        src="https://images.unsplash.com/photo-1605727216803-2f64b1e7e2d4?auto=format&fit=crop&w=1350&q=80"
        alt="Roofing hero"
        className="w-full h-96 object-cover"
      />
    </section>
  );
};

export default Home;
