import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import './AdminDashboard.scss'; // We will create this file next

// A generic component to handle the report display logic
const ReportSection = ({ title, fetchData }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchData(startDate, endDate)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'An unknown error occurred.');
        setLoading(false);
      });
  }, [fetchData, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="report-section">
      <h3>{title}</h3>
      <div className="date-filter">
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </label>
        <button onClick={loadData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <p className="error-message">Error: {error}</p>}
      
      {data && !loading && (
        <table>
          <thead>
            {data.length > 0 && (
              <tr>
                {Object.keys(data[0]).map(key => <th key={key}>{key}</th>)}
              </tr>
            )}
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => <td key={i}>{String(value)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data && data.length === 0 && !loading && <p>No data available for the selected date range.</p>}
    </div>
  );
};


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('newMembers');

  const renderContent = () => {
    switch (activeTab) {
      case 'newMembers':
        return <ReportSection title="New Member Registrations" fetchData={adminService.getNewMembers} />;
      case 'newHunts':
        return <ReportSection title="New Scavenger Hunts" fetchData={adminService.getNewHunts} />;
      case 'visitors':
        return <ReportSection title="Visitor Analytics" fetchData={adminService.getVisitorData} />;
      // case 'aiUsage':
      //   return <ReportSection title="AI API Usage" fetchData={adminService.getAiUsageData} />;
      default:
        return <p>Select a report to view.</p>;
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <nav className="admin-nav">
        <button onClick={() => setActiveTab('newMembers')} className={activeTab === 'newMembers' ? 'active' : ''}>New Members</button>
        <button onClick={() => setActiveTab('newHunts')} className={activeTab === 'newHunts' ? 'active' : ''}>New Hunts</button>
        <button onClick={() => setActiveTab('visitors')} className={activeTab === 'visitors' ? 'active' : ''}>Visitors</button>
        <button onClick={() => setActiveTab('aiUsage')} className={activeTab === 'aiUsage' ? 'active' : ''}>AI Usage</button>
      </nav>
      <div className="report-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;