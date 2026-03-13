import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { SiteConfig, fetchSiteConfig, getDefaultConfig } from '../lib/siteConfig';

interface ConfigContextType {
  config: SiteConfig;
  refreshConfig: () => Promise<void>;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(getDefaultConfig());
  const [loading, setLoading] = useState(true);

  const refreshConfig = async () => {
    try {
      const data = await fetchSiteConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config from backend, using defaults', error);
      // Fallback is already set as initial state or we could re-merge here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  // Dynamically update CSS variables (primaryHue) as per guide
  useEffect(() => {
    if (config.primaryHue) {
      document.documentElement.style.setProperty('--primary-hue', config.primaryHue);
    }
  }, [config.primaryHue]);

  return (
    <ConfigContext.Provider value={{ config, refreshConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
