import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded p-2 dark:bg-gray-800"
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="w-full border rounded p-2 dark:bg-gray-800"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <textarea
          className="w-full border rounded p-2 dark:bg-gray-800"
          name="message"
          placeholder="Message"
          rows="4"
          value={form.message}
          onChange={handleChange}
          required
        ></textarea>
        <button
          type="submit"
          className="bg-[#2366d1] hover:bg-[#1e59b8] text-white py-2 px-4 rounded w-full dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
