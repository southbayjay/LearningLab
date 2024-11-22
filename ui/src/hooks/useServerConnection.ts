import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/constants';

interface ServerConnectionState {
  serverPort: number | null;
  error: string | null;
}

export const useServerConnection = (): ServerConnectionState => {
  const [serverPort, setServerPort] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`);
        if (response.ok) {
          console.log('Server found on port 3000');
          setServerPort(3000);
          setError(null);
        }
      } catch (err) {
        console.error('Error connecting to server:', err);
        setError('Unable to connect to server. Please ensure the server is running on port 3000.');
        setServerPort(null);
      }
    };

    checkServer();
  }, []);

  return { serverPort, error };
};
