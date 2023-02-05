import { StoreSchema } from 'main/settings';
import { useEffect, useState } from 'react';

export function useSettings() {
  const [settings, setSettings] = useState<StoreSchema>();

  useEffect(() => {
    const getSettings = async () => {
      const s = await window.electronAPI.ipcRenderer.getSettings();
      setSettings(s);
    };
    getSettings();
  }, []);
  return settings;
}
