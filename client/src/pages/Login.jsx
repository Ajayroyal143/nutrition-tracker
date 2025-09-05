import React, { useState } from 'react';
import { ICONS } from '../data/icons';
import { toast } from 'react-toastify';

const Login = ({ onLogin, onSwitchToSignup }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      // Delegate login to parent so it can set auth state and storage
      await onLogin(form);

    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message);
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow rounded-3 p-4" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="d-flex justify-content-center align-items-center mb-3">
          <ICONS.Logo size={32} className="text-success me-2" />
          <h2 className="fw-bold text-success mb-0">NutriTrack</h2>
        </div>
        <h4 className="text-center mb-4">Welcome Back</h4>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-semibold">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Remember me + Forgot password */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="btn btn-link p-0 text-success small text-decoration-none"
              onClick={() => toast.info('Forgot password flow coming soon!')}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Switch to signup */}
        <p className="text-center text-muted mt-3">
          Don’t have an account?{' '}
          <button
            type="button"
            className="btn btn-link p-0 text-success fw-semibold"
            onClick={onSwitchToSignup}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
