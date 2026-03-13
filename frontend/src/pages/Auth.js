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
      const response =
        mode === 'signup'
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
    <div style={styles.container}>

      {/* Left Panel */}
      <div style={styles.left}>
        <h1>🌍 Pollution Monitor</h1>
        <p>Track Air Quality & Humidity in Real Time</p>
      </div>

      {/* Right Panel */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2>{mode === 'login' ? 'Login' : 'Create Account'}</h2>

          {error && <p style={styles.error}>{error}</p>}

          <form onSubmit={handleSubmit}>

            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                style={styles.input}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              style={styles.input}
            />

            <input
              type="password"
              placeholder="Password"
              minLength={6}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              style={styles.input}
            />

            <button type="submit" style={styles.button} disabled={loading}>
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Login'
                : 'Sign Up'}
            </button>

          </form>

          <p style={{ marginTop: 15 }}>
            {mode === 'login' ? (
              <>
                New user?{' '}
                <button style={styles.linkBtn} onClick={() => setMode('signup')}>
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have account?{' '}
                <button style={styles.linkBtn} onClick={() => setMode('login')}>
                  Login
                </button>
              </>
            )}
          </p>

        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial'
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg,#2c7be5,#00c9a7)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f0f4f8'
  },
  card: {
    width: '350px',
    padding: '30px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.15)'
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '5px'
  },
  button: {
    width: '100%',
    padding: '10px',
    background: '#2c7be5',
    border: 'none',
    color: 'white',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  linkBtn: {
    border: 'none',
    background: 'none',
    color: '#2c7be5',
    cursor: 'pointer'
  },
  error: {
    color: 'red'
  }
};

export default Auth;