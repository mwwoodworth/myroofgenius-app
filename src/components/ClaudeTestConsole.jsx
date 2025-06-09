import React, { useState } from 'react';

const roles = [
  'contractor',
  'owner',
  'engineer',
  'architect',
  'homeowner',
];

export default function ClaudeTestConsole() {
  const [prompt, setPrompt] = useState('');
  const [role, setRole] = useState('contractor');
  const [response, setResponse] = useState('');

  const sendPrompt = async () => {
    try {
      const res = await fetch(`/webhooks/claude-task-trigger/${role}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_type: 'role_content_generation',
          role,
          input: prompt,
          output_format: ['markdown', 'summary', 'gdrive'],
        }),
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse('Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Claude Test Console</h2>
      <textarea
        rows={6}
        style={{ width: '100%' }}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt here"
      />
      <div style={{ margin: '10px 0' }}>
        <label>Role: </label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <button onClick={sendPrompt}>Send to Claude</button>
      <pre style={{ marginTop: 20, background: '#f4f4f4', padding: 10 }}>
        {response}
      </pre>
    </div>
  );
}
