'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { WorksheetGenerator } from '@/components/worksheet-generator';
import { WorksheetDisplay } from '@/components/worksheet-display';
import { GradeLevel, Topic } from '@/lib/constants';
import { Worksheet } from '@/types/worksheet';

export default function Home() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);
  
  // Form state
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | ''>('');
  const [topic, setTopic] = useState<Topic | ''>('');
  
  // Worksheet state
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dark mode effect
  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleGenerate = async () => {
    if (!gradeLevel || !topic) {
      setError('Please select both grade level and topic');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-worksheet', {
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

      const worksheetData = await response.json();
      setWorksheet(worksheetData);
    } catch (err) {
      console.error('Error generating worksheet:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate worksheet');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Create Custom Reading Worksheets
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Generate engaging, grade-appropriate reading comprehension worksheets 
            tailored to your students&apos; needs using AI technology.
          </p>
        </div>

        <WorksheetGenerator
          gradeLevel={gradeLevel}
          topic={topic}
          loading={loading}
          onGradeLevelChange={setGradeLevel}
          onTopicChange={setTopic}
          onGenerate={handleGenerate}
        />

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && <WorksheetDisplay worksheet={worksheet} onPrint={handlePrint} />}
      </main>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
            color: black !important;
          }
          
          .worksheet-content {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          
          .answer-key {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
}
