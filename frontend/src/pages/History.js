import React, { useState, useEffect } from 'react';
import { historyAPI } from '../services/api';
import { FaHistory, FaTrash, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await historyAPI.getAll();
      setHistory(response.data.data);
    } catch (err) {
      setError('Failed to fetch history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await historyAPI.delete(id);
        setHistory(history.filter(item => item._id !== id));
      } catch (err) {
        alert('Failed to delete entry');
        console.error(err);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      try {
        await historyAPI.clearAll();
        setHistory([]);
      } catch (err) {
        alert('Failed to clear history');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAQILabel = (aqi) => {
    const labels = {
      1: 'Good',
      2: 'Fair',
      3: 'Moderate',
      4: 'Poor',
      5: 'Very Poor'
    };
    return labels[aqi] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>
            <FaHistory /> Check History
          </h2>
          {history.length > 0 && (
            <button onClick={handleClearAll} className="btn btn-danger">
              <FaTrash /> Clear All
            </button>
          )}
        </div>

        {error && <div className="error">{error}</div>}

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <FaHistory size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No history available. Start by checking a location!</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item._id} className="history-item">
                <div className="history-header">
                  <div>
                    <div className="history-location">
                      <FaMapMarkerAlt /> {item.location.city}, {item.location.country}
                    </div>
                    <div className="history-date">
                      <FaClock /> {formatDate(item.timestamp)}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(item._id)} 
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="history-details">
                  <div className="info-item">
                    <h4>AQI</h4>
                    <p>{item.pollutionData.aqi} - {getAQILabel(item.pollutionData.aqi)}</p>
                  </div>
                  <div className="info-item">
                    <h4>Risk Level</h4>
                    <p>
                      <span className={`risk-badge risk-${item.healthRisk.level.replace(' ', '')}`}>
                        {item.healthRisk.level}
                      </span>
                    </p>
                  </div>
                  <div className="info-item">
                    <h4>Risk Score</h4>
                    <p>{item.healthRisk.score}/100</p>
                  </div>
                  <div className="info-item">
                    <h4>Temperature</h4>
                    <p>{item.weatherData.temperature}°C</p>
                  </div>
                  <div className="info-item">
                    <h4>Humidity</h4>
                    <p>{item.weatherData.humidity}%</p>
                  </div>
                  <div className="info-item">
                    <h4>Wind Speed</h4>
                    <p>{item.weatherData.windSpeed} m/s</p>
                  </div>
                </div>

                {item.userHealthProfile && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <strong>User Profile:</strong> Age {item.userHealthProfile.age}, 
                    {item.userHealthProfile.conditions.length > 0 
                      ? ` Conditions: ${item.userHealthProfile.conditions.join(', ')}`
                      : ' No health conditions'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
