import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axios.get(`http://localhost:3000/api/auth/reset-password/${token}`);
        setTokenValid(true);
      } catch (err) {
        console.error('Token verification error:', err);
        setMessage(err.response?.data?.error || 'Invalid or expired password reset token.');
        setTokenValid(false);
        toast.error(err.response?.data?.error || 'Invalid or expired token.');
      } finally {
        setInitialCheckDone(true);
      }
    };
    if (token) {
      verifyToken();
    } else {
      setMessage('No reset token provided.');
      setInitialCheckDone(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`http://localhost:3000/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message || 'Password has been reset successfully!');
      toast.success(res.data.message || 'Password reset successful!');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login'); // Redirect to login page after successful reset
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setMessage(err.response?.data?.error || 'Failed to reset password. Please try again.');
      toast.error(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!initialCheckDone) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Verifying token...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger" role="alert">
          {message}
        </div>
        <Link to="/forgot-password" className="btn btn-primary">Request New Reset Link</Link>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Reset Password</h4>
            </div>
            <div className="card-body">
              <p className="card-text">
                Please enter your new password.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="passwordInput" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="passwordInput"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPasswordInput" className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPasswordInput"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {message && (
                  <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`} role="alert">
                    {message}
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
