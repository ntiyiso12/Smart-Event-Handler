// src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import '../../styles/abstracts-auth/_auth.scss';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'attendee',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const extractErrorMessage = (err) => {
    if (err?.response?.data) {
      const data = err.response.data;

      if (Array.isArray(data?.details) && data.details.length > 0) {
        return data.details[0].message;
      }

      if (Array.isArray(data?.error?.details) && data.error.details.length > 0) {
        return data.error.details[0].message;
      }

      if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message;
      }

      if (typeof data === 'string' && data.trim()) {
        return data;
      }
    }

    if (err?.request && !err?.response) {
      return 'Unable to reach the server. Check that the backend is running and API URL is correct.';
    }

    if (typeof err?.message === 'string' && err.message.trim()) {
      return err.message;
    }

    return 'Registration failed. Please try again.';
  };

  // Password policy aligned with backend default:
  // min 10 chars, at least one uppercase, one lowercase, one digit
  const validatePasswordStrength = (password) => {
    const minLength = password.length >= 10;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return minLength && hasUpper && hasLower && hasNumber;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'password') {
      if (value && !validatePasswordStrength(value)) {
        toast.error(
          'Password must be at least 10 characters and include uppercase, lowercase, and a number.',
          { id: 'password-toast', duration: 4000 }
        );
      } else {
        toast.dismiss('password-toast');
      }
    }

    if (name === 'confirmPassword' || name === 'password') {
      if (form.confirmPassword && value !== form.confirmPassword) {
        toast.error('Passwords do not match!', {
          id: 'mismatch-toast',
          duration: 4000,
        });
      } else {
        toast.dismiss('mismatch-toast');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePasswordStrength(form.password)) {
      toast.error(
        'Password must be at least 10 characters and include uppercase, lowercase, and a number.'
      );
      setLoading(false);
      return;
    }

    if (form.role === 'organizer' && !form.phone.trim()) {
      toast.error('Phone number is required for organizer registration.');
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        verify_password: form.confirmPassword,
        cellphone_number: form.phone.trim(),
        role: form.role.toUpperCase(),
      });

      toast.success('Registration successful! Please check your email.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-center">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p>Join our platform and get started</p>

        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
          disabled={loading}
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          disabled={loading}
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          required={form.role === 'organizer'}
          disabled={loading}
        />

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((p) => !p)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="password-wrapper">
          <input
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            disabled={loading}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirm((p) => !p)}
            aria-label="Toggle confirm password visibility"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <label htmlFor="role">I want to register as:</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <span onClick={() => navigate('/login')}>Login</span>
          </p>
        </div>
      </form>
    </div>
  );
}
