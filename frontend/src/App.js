import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';
import { authAPI } from './services/api';
import { FaLeaf } from 'react-icons/fa';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        Home
      </Link>
      <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>
        History
      </Link>
      <Link to="/analytics" className={location.pathname === '/analytics' ? 'active' : ''}>
        Analytics
      </Link>
    </nav>
  );
}

function App() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [bootLoading, setBootLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setBootLoading(false);
      return;
    }

    authAPI.me()
      .then((response) => setCurrentUser(response.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setBootLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  if (bootLoading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Router>
        <div className="App">
          <header className="header">
            <div className="header-content">
              <div className="logo">
                <h1>
                  <FaLeaf />
                  Pollution Health Assistant
                </h1>
              </div>
            </div>
          </header>
          <Auth onAuthenticated={setCurrentUser} />
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="App">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <h1>
                <FaLeaf />
                Pollution Health Assistant
              </h1>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Welcome, {currentUser.name}</div>
            </div>
            <Navigation />
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home currentUser={currentUser} onUserUpdate={setCurrentUser} />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
