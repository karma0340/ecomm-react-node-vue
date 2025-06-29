import React, { useState } from 'react';
import axios from 'axios';

function AuthModal({ show, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login');
  // Use 'identifier' for login (can be email or username)
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  // Use username for registration (not 'name'), plus email and password
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email validation helper
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const identifier = loginData.identifier ? loginData.identifier.trim() : '';
    const password = loginData.password ? loginData.password.trim() : '';
    if (!identifier || !password) {
      setError('Please enter your email/username and password.');
      return;
    }
    try {
      // Send either email or username depending on the input
      const payload = identifier.includes('@')
        ? { email: identifier, password }
        : { username: identifier, password };

      console.log('Attempting login with:', payload);

      const res = await axios.post(
        'http://localhost:3000/api/auth/login',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Login success:', res.data);
      localStorage.setItem('token', res.data.accessToken);
      setLoginData({ identifier: '', password: '' });
      setError('');
      setSuccess('');
      if (typeof onAuthSuccess === 'function') onAuthSuccess();
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Backend error response:', err.response.data);
      }
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed!'
      );
    }
  };

  // Handle register submit
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const username = registerData.username ? registerData.username.trim() : '';
    const email = registerData.email ? registerData.email.trim() : '';
    const password = registerData.password ? registerData.password.trim() : '';
    if (!username || !email || !password) {
      setError('All fields are required!');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:3000/api/auth/signup',
        { username, email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setRegisterData({ username: '', email: '', password: '' }); // Clear fields
      setError('');
      setSuccess('Registration successful! Please login.');
      setActiveTab('login');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed!'
      );
    }
  };

  // Clear error and success on tab switch
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <ul className="nav nav-tabs card-header-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => handleTabSwitch('login')}
                >
                  Login
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
                  onClick={() => handleTabSwitch('register')}
                >
                  Register
                </button>
              </li>
            </ul>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} autoComplete="on">
                <div className="mb-3">
                  <label>Email or Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={loginData.identifier}
                    onChange={e => setLoginData({ ...loginData, identifier: e.target.value })}
                    required
                    placeholder="Enter your email or username"
                  />
                </div>
                <div className="mb-3">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Login</button>
              </form>
            ) : (
              <form onSubmit={handleRegister} autoComplete="on">
                <div className="mb-3">
                  <label>Username</label>
                  <input
                    type="text"
                    className="form-control"
                    value={registerData.username}
                    onChange={e => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                    placeholder="Choose a username"
                  />
                </div>
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={registerData.email}
                    onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className="mb-3">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={registerData.password}
                    onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    placeholder="Create a password"
                  />
                </div>
                <button type="submit" className="btn btn-success w-100">Register</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
