import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { FaChartBar, FaMapMarkedAlt } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getOverview(timeframe);
      setAnalytics(response.data.data);
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = {
    Low: '#10b981',
    Moderate: '#f59e0b',
    High: '#f97316',
    'Very High': '#ef4444',
    Severe: '#7f1d1d'
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalChecks === 0) {
    return (
      <div className="container">
        <div className="card">
          <h2>
            <FaChartBar /> Analytics Dashboard
          </h2>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <FaChartBar size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>No data available for analytics. Start by checking some locations!</p>
          </div>
        </div>
      </div>
    );
  }

  const riskDistributionData = Object.entries(analytics.riskLevelDistribution)
    .filter(([key, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value: value
    }));

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>
            <FaChartBar /> Analytics Dashboard
          </h2>
          <div>
            <label style={{ marginRight: '1rem' }}>Timeframe:</label>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(parseInt(e.target.value))}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '2px solid #e0e0e0' }}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="analytics-grid">
          <div className="stat-card">
            <div className="stat-label">Total Checks</div>
            <div className="stat-value">{analytics.totalChecks}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unique Locations</div>
            <div className="stat-value">{analytics.uniqueLocations}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average AQI</div>
            <div className="stat-value">{analytics.averageAQI}</div>
          </div>
        </div>

        {riskDistributionData.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Risk Level Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {analytics.mostCheckedLocations && analytics.mostCheckedLocations.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>
              <FaMapMarkedAlt /> Most Checked Locations
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.mostCheckedLocations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {analytics.recentChecks && analytics.recentChecks.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Recent Checks</h3>
            <div className="history-list">
              {analytics.recentChecks.slice(0, 5).map((item) => (
                <div key={item._id} className="history-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{item.location.city}, {item.location.country}</strong>
                      <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className={`risk-badge risk-${item.healthRisk.level.replace(' ', '')}`}>
                        {item.healthRisk.level}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div>
                      <strong>AQI:</strong> {item.pollutionData.aqi}
                    </div>
                    <div>
                      <strong>Risk Score:</strong> {item.healthRisk.score}/100
                    </div>
                    <div>
                      <strong>Temp:</strong> {item.weatherData.temperature}°C
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
