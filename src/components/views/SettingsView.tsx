"use client";

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  SunIcon, 
  MoonIcon, 
  CogIcon, 
  BellIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export function SettingsView() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    newLeads: true,
    workOrderReminders: true,
    invoiceAlerts: true,
    equipmentMaintenance: false,
  });

  const [businessSettings, setBusinessSettings] = useState({
    companyName: 'TreeShop Operations',
    defaultTaxRate: 8.5,
    defaultProfitMargin: 50,
    timeZone: 'America/New_York',
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your app preferences and business settings</p>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Theme Settings */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <SunIcon className="w-5 h-5 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Dark Mode</div>
              <div className="text-sm text-muted-foreground">
                Use {theme === 'dark' ? 'dark' : 'light'} theme
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <BellIcon className="w-5 h-5 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">
                    {key === 'newLeads' ? 'New Leads' :
                     key === 'workOrderReminders' ? 'Work Order Reminders' :
                     key === 'invoiceAlerts' ? 'Invoice Alerts' :
                     'Equipment Maintenance'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {key === 'newLeads' ? 'Get notified when new leads are created' :
                     key === 'workOrderReminders' ? 'Reminders for scheduled work orders' :
                     key === 'invoiceAlerts' ? 'Alerts for overdue invoices' :
                     'Maintenance schedule notifications'}
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <CurrencyDollarIcon className="w-5 h-5 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Business Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={businessSettings.companyName}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={businessSettings.defaultTaxRate}
                  onChange={(e) => setBusinessSettings(prev => ({ ...prev, defaultTaxRate: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Default Profit Margin (%)
                </label>
                <input
                  type="number"
                  value={businessSettings.defaultProfitMargin}
                  onChange={(e) => setBusinessSettings(prev => ({ ...prev, defaultProfitMargin: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TreeScore Settings */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <CogIcon className="w-5 h-5 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">TreeScore Settings</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Setup Cost ($)
              </label>
              <input
                type="number"
                defaultValue={200}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Rate Per Point ($)
              </label>
              <input
                type="number"
                step="0.01"
                defaultValue={0.75}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              />
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <ShieldCheckIcon className="w-5 h-5 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">App Information</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="text-foreground">Today</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="text-foreground">PWA-2025.1</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
            Save Settings
          </button>
          
          <button className="w-full bg-muted text-muted-foreground py-2 px-4 rounded-lg hover:bg-muted/80 transition-colors">
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}