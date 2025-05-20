import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/constants';

interface ServerConnectionState {
  serverPort: number | null;
  error: string | null;
}

export const useServerConnection = (): ServerConnectionState => {
  const [serverPort, setServerPort] = useState<number | null>(3000); // Always assume server is available in production
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In production, we don't need to check for server connection
    // The API endpoints are available at the same domain
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((import.meta as any).env?.PROD) {
      return;
    }
    
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`);
        if (response.ok) {
          console.log('Server health check passed');
          setServerPort(3000);
          setError(null);
        }
      } catch (err) {
        console.error('Error connecting to server:', err);
        setError('Unable to connect to server. Please ensure the server is running.');
        setServerPort(null);
      }
    };

    checkServer();
  }, []);

  return { serverPort, error };
};
