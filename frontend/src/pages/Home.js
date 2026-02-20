import React, { useState, useEffect } from 'react';
import { pollutionAPI, healthAPI, authAPI, aiAPI } from '../services/api';
import { FaSearch, FaUser, FaWind, FaThermometerHalf, FaTint, FaCrosshairs } from 'react-icons/fa';

function Home({ currentUser, onUserUpdate }) {
  const [city, setCity] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: currentUser?.name || '',
    age: currentUser?.age || '',
    healthConditions: currentUser?.healthConditions || ['none'],
    smokingStatus: currentUser?.smokingStatus || 'non-smoker'
  });
  const [loading, setLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [healthConditions, setHealthConditions] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);

  useEffect(() => {
    fetchHealthConditions();
    fetchAIInsights();
  }, []);

  useEffect(() => {
    setUserProfile({
      name: currentUser?.name || '',
      age: currentUser?.age || '',
      healthConditions: currentUser?.healthConditions || ['none'],
      smokingStatus: currentUser?.smokingStatus || 'non-smoker'
    });
  }, [currentUser]);

  const fetchHealthConditions = async () => {
    try {
      const response = await healthAPI.getConditions();
      setHealthConditions(response.data.data.conditions);
    } catch (err) {
      console.error('Error fetching health conditions:', err);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const response = await aiAPI.getInsights();
      setAiInsight(response.data.data);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
    }
  };

  const handleConditionChange = (condition) => {
    if (condition === 'none') {
      setUserProfile({ ...userProfile, healthConditions: ['none'] });
    } else {
      const filtered = userProfile.healthConditions.filter((c) => c !== 'none');
      if (filtered.includes(condition)) {
        setUserProfile({
          ...userProfile,
          healthConditions: filtered.filter((c) => c !== condition)
        });
      } else {
        setUserProfile({
          ...userProfile,
          healthConditions: [...filtered, condition]
        });
      }
    }
  };

  const saveHealthProfile = async () => {
    setError('');

    if (!userProfile.name || !userProfile.age || userProfile.healthConditions.length === 0) {
      setError('Fill name, age, and at least one health condition before saving profile');
      return;
    }

    try {
      setProfileSaving(true);
      const response = await authAPI.updateProfile({
        name: userProfile.name,
        age: parseInt(userProfile.age, 10),
        healthConditions: userProfile.healthConditions,
        smokingStatus: userProfile.smokingStatus
      });
      onUserUpdate(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const useMyLocation = async () => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setCity('');
      },
      () => {
        setError('Unable to access your location. Please allow location permission.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);

    if (!city && !coordinates) {
      setError('Please enter a city or use your current location');
      return;
    }

    if (!userProfile.name || !userProfile.age) {
      setError('Please fill in all required profile fields');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userProfile: {
          ...userProfile,
          age: parseInt(userProfile.age, 10)
        }
      };

      if (city) {
        payload.city = city;
      } else {
        payload.lat = coordinates.lat;
        payload.lon = coordinates.lon;
      }

      const response = await pollutionAPI.analyzeHealthRisk(payload);
      setResults(response.data.data);
      fetchAIInsights();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to analyze health risk. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi) => {
    const colors = {
      1: '#10b981',
      2: '#84cc16',
      3: '#f59e0b',
      4: '#f97316',
      5: '#ef4444'
    };
    return colors[aqi] || '#666';
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

  return (
    <div className="container">
      <div className="card">
        <h2>
          <FaSearch /> Check Your Health Risk
        </h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>City Name</label>
            <input
              type="text"
              placeholder="Enter city name (e.g., London, New York)"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (e.target.value) setCoordinates(null);
              }}
            />
          </div>

          <button type="button" className="btn btn-secondary" onClick={useMyLocation}>
            <FaCrosshairs /> Use My Current Location
          </button>
          {coordinates && (
            <div className="success" style={{ marginTop: '1rem' }}>
              Using coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lon.toFixed(4)}
            </div>
          )}

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            <FaUser /> Your Health Profile
          </h3>

          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={userProfile.name}
              onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Age *</label>
            <input
              type="number"
              placeholder="Enter your age"
              min="1"
              max="120"
              value={userProfile.age}
              onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Health Conditions *</label>
            <div className="checkbox-group">
              {healthConditions.map((condition) => (
                <div key={condition.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={condition.value}
                    checked={userProfile.healthConditions.includes(condition.value)}
                    onChange={() => handleConditionChange(condition.value)}
                  />
                  <label htmlFor={condition.value}>{condition.label}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Smoking Status</label>
            <select
              value={userProfile.smokingStatus}
              onChange={(e) => setUserProfile({ ...userProfile, smokingStatus: e.target.value })}
            >
              <option value="non-smoker">Non-Smoker</option>
              <option value="smoker">Smoker</option>
              <option value="ex-smoker">Ex-Smoker</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={saveHealthProfile} disabled={profileSaving}>
              {profileSaving ? 'Saving...' : 'Save Health Status'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Health Risk'}
            </button>
          </div>
        </form>
      </div>

      {aiInsight && (
        <div className="card">
          <h2>Personalized AI Insight</h2>
          <p style={{ marginBottom: '1rem' }}>{aiInsight.summary}</p>
          <ul>
            {aiInsight.actions.map((action, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      {loading && (
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing environmental data and health risks...</p>
          </div>
        </div>
      )}

      {results && (
        <div className="results-section">
          <div className="card">
            <h2>Analysis Results for {results.location.city}, {results.location.country}</h2>

            <div className="info-grid">
              <div className="info-item">
                <h4>Air Quality Index</h4>
                <p style={{ color: getAQIColor(results.pollution.aqi) }}>
                  {results.pollution.aqi} - {getAQILabel(results.pollution.aqi)}
                </p>
              </div>
              <div className="info-item">
                <h4><FaThermometerHalf /> Temperature</h4>
                <p>{results.weather.temperature}C</p>
              </div>
              <div className="info-item">
                <h4><FaTint /> Humidity</h4>
                <p>{results.weather.humidity}%</p>
              </div>
              <div className="info-item">
                <h4><FaWind /> Wind Speed</h4>
                <p>{results.weather.windSpeed} m/s</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <h3>Health Risk Level</h3>
              <div className={`risk-badge risk-${results.healthRisk.level.replace(' ', '')}`}>
                {results.healthRisk.level}
              </div>
              <div className="aqi-indicator" style={{ color: getAQIColor(results.pollution.aqi) }}>
                Risk Score: {results.healthRisk.score}/100
              </div>
            </div>

            {results.healthRisk.warnings && results.healthRisk.warnings.length > 0 && (
              <div className="warnings">
                <h3>Warnings</h3>
                <ul>
                  {results.healthRisk.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="recommendations">
              <h3>Recommendations</h3>
              <ul>
                {results.healthRisk.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            {results.healthRisk.suggestedMedicines && results.healthRisk.suggestedMedicines.length > 0 && (
              <div className="medicines">
                <h3>Suggested Medicines</h3>
                <ul>
                  {results.healthRisk.suggestedMedicines.map((medicine, index) => (
                    <li key={index}>{medicine}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
