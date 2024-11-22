import { useState } from 'react';
import { API_CONFIG } from '../config/constants';

interface WorksheetGeneratorState {
  worksheet: any | null;
  error: string | null;
  loading: boolean;
  generateWorksheet: (gradeLevel: string, topic: string) => Promise<void>;
}

export const useWorksheetGenerator = (serverPort: number | null): WorksheetGeneratorState => {
  const [worksheet, setWorksheet] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateWorksheet = async (gradeLevel: string, topic: string) => {
    if (!serverPort || !gradeLevel || !topic) {
      setError('Please select both grade level and topic before generating.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.generateWorksheet}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gradeLevel,
          topic,
          complexity: 'medium',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate worksheet');
      }

      const data = await response.json();
      setWorksheet(data);
    } catch (err: any) {
      console.error('Error generating worksheet:', err);
      setError(err.message || 'Failed to generate worksheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { worksheet, error, loading, generateWorksheet };
};
