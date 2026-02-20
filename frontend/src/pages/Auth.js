import React, { useState } from 'react';
import { authAPI } from '../services/api';

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = mode === 'signup'
        ? await authAPI.signup(form)
        : await authAPI.login({ email: form.email, password: form.password });

      localStorage.setItem('token', response.data.token);
      onAuthenticated(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 480, margin: '2rem auto' }}>
        <h2>{mode === 'login' ? 'Login' : 'Create Account'}</h2>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '1rem' }}>
          {mode === 'login' ? (
            <button className="btn btn-secondary" onClick={() => setMode('signup')}>
              New user? Sign up
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={() => setMode('login')}>
              Already have account? Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
