import { useEffect, useState } from "react";

export function useLocalSetting<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* unavailable: in-memory only */ }
  }, [key, value]);
  return [value, setValue] as const;
}
