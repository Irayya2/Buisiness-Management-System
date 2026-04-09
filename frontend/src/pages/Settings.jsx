import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'team', label: 'Team' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'export', label: 'Export Preferences' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-section">
            <h3>Profile Settings</h3>
            <p>Manage your personal information and preferences.</p>
            {/* Add profile form here */}
          </div>
        );
      case 'team':
        return (
          <div className="settings-section">
            <h3>Team Management</h3>
            <p>Manage team members and permissions.</p>
            {/* Add team management here */}
          </div>
        );
      case 'notifications':
        return (
          <div className="settings-section">
            <h3>Notification Preferences</h3>
            <p>Configure how you receive notifications.</p>
            {/* Add notification settings here */}
          </div>
        );
      case 'export':
        return (
          <div className="settings-section">
            <h3>Export Preferences</h3>
            <p>Set default export formats and options.</p>
            {/* Add export settings here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page container">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="breadcrumb">Home / Settings</div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="settings-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

