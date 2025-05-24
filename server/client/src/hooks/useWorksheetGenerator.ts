import { useState } from 'react';
import { API_CONFIG } from '../config/constants';
import { Worksheet } from '../types/worksheet';

interface WorksheetGeneratorState {
  worksheet: Worksheet | null;
  error: string | null;
  loading: boolean;
  generateWorksheet: (gradeLevel: string, topic: string) => Promise<void>;
}

export const useWorksheetGenerator = (): WorksheetGeneratorState => {
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateWorksheet = async (gradeLevel: string, topic: string) => {
    if (!gradeLevel || !topic) {
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
    } catch (err) {
      console.error('Error generating worksheet:', err);
      // Improved error handling with type checking
      if (err instanceof Error) {
        setError(err.message || 'Failed to generate worksheet. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return { worksheet, error, loading, generateWorksheet };
};
