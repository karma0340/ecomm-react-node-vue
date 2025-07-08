import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'If an account with that email exists, a password reset link has been sent.');
      toast.success(res.data.message || 'Password reset email sent (if email exists). Please check your inbox.');
      setEmail(''); // Clear email input
    } catch (err) {
      console.error('Forgot password error:', err);
      setMessage(err.response?.data?.error || 'Failed to send password reset email. Please try again.');
      toast.error(err.response?.data?.error || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Forgot Password</h4>
            </div>
            <div className="card-body">
              <p className="card-text">
                Enter your email address below and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-describedby="emailHelp"
                  />
                  <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                {message && (
                  <div className={`alert ${message.includes('sent') || message.includes('exists') ? 'alert-success' : 'alert-danger'}`} role="alert">
                    {message}
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-3 text-center">
                <Link to="/login" className="btn btn-link">Back to Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
