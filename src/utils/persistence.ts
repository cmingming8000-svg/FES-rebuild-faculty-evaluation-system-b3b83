const STORAGE_KEY = 'fes_data';
const STORAGE_VERSION = '4.0.0';

export function saveToLocalStorage(inputData: any): boolean {
  try {
    const persistedData = { version: STORAGE_VERSION, timestamp: new Date().toISOString(), data: inputData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData));
    return true;
  } catch (error) {
    console.error('Failed to save:', error);
    return false;
  }
}

export function loadFromLocalStorage(): any {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed.version !== STORAGE_VERSION) return null;
    return parsed.data;
  } catch (error) {
    console.error('Failed to load:', error);
    return null;
  }
}

export function clearLocalStorage(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function hasPersistedData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function getStorageSize(): number {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? new Blob([data]).size / 1024 : 0;
}

export function exportData(inputData: any): void {
  try {
    const persistedData = { version: STORAGE_VERSION, timestamp: new Date().toISOString(), data: inputData };
    const json = JSON.stringify(persistedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fes_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export ', error);
    throw error;
  }
}

export function importData(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.version !== STORAGE_VERSION) {
          reject(new Error('Data version mismatch'));
          return;
        }
        resolve(parsed.data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
