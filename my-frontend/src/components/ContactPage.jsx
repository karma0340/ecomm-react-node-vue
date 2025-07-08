import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // You can send the form data to your backend here (e.g., using axios)
    setStatus('Thank you for contacting us! We will get back to you soon.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container" style={{ maxWidth: 600, margin: '2rem auto' }}>
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Message</label>
          <textarea name="message" value={form.message} onChange={handleChange} className="form-control" rows={5} required />
        </div>
        <button className="btn btn-primary" type="submit">Send</button>
      </form>
      {status && <div className="alert alert-success mt-3">{status}</div>}
    </div>
  );
}
