import { OpenAIConfig } from '../types';

const CONFIG_KEY = 'pss_caio_config';

export const configService = {
  saveConfig: (config: OpenAIConfig): void => {
    try {
      const configData = JSON.stringify(config);
      localStorage.setItem(CONFIG_KEY, configData);
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  },

  loadConfig: (): OpenAIConfig | null => {
    try {
      const configData = localStorage.getItem(CONFIG_KEY);
      if (configData) {
        return JSON.parse(configData);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
    return null;
  },

  clearConfig: (): void => {
    try {
      localStorage.removeItem(CONFIG_KEY);
    } catch (error) {
      console.error('Failed to clear config:', error);
    }
  }
};