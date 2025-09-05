import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { ICONS } from '../data/icons';

const Register = ({ onSignup, onSwitchToLogin }) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    height: '',
    weight: '',
    goal: 'Maintain',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    onSignup(form);
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow rounded-3 p-4" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="d-flex justify-content-center align-items-center mb-3">
          <ICONS.Logo size={32} className="text-success me-2" />
          <h2 className="fw-bold text-success mb-0">NutriTrack</h2>
        </div>
        <h4 className="text-center mb-4">Create an Account</h4>

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

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={form.email}
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

          {/* Confirm Password */}
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Age */}
          <div className="mb-3">
            <label htmlFor="age" className="form-label fw-semibold">Age</label>
            <input
              type="number"
              className="form-control"
              id="age"
              name="age"
              value={form.age}
              onChange={handleChange}
              required
            />
          </div>

          {/* Height */}
          <div className="mb-3">
            <label htmlFor="height" className="form-label fw-semibold">Height (cm)</label>
            <input
              type="number"
              className="form-control"
              id="height"
              name="height"
              value={form.height}
              onChange={handleChange}
              required
            />
          </div>

          {/* Weight */}
          <div className="mb-3">
            <label htmlFor="weight" className="form-label fw-semibold">Weight (kg)</label>
            <input
              type="number"
              className="form-control"
              id="weight"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              required
            />
          </div>

          {/* Goal */}
          <div className="mb-3">
            <label htmlFor="goal" className="form-label fw-semibold">Goal</label>
            <select
              className="form-select"
              id="goal"
              name="goal"
              value={form.goal}
              onChange={handleChange}
            >
              <option value="Maintain">Maintain Weight</option>
              <option value="Lose">Lose Weight</option>
              <option value="Gain">Gain Weight</option>
            </select>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-success w-100">
            Register
          </button>
        </form>

        {/* Switch to login */}
        <p className="text-center text-muted mt-3">
          Already have an account?{' '}
          <button
            type="button"
            className="btn btn-link p-0 text-success fw-semibold"
            onClick={onSwitchToLogin}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
