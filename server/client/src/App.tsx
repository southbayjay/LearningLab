import React, { useState, useEffect, Suspense } from 'react';
import { useServerConnection } from './hooks/useServerConnection';
import { useWorksheetGenerator } from './hooks/useWorksheetGenerator';
import { Navbar } from './components/Navbar';
import { WorksheetGenerator } from './components/WorksheetGenerator';
import { WorksheetDisplay } from './components/WorksheetDisplay';
import { PrintStyles } from './components/PrintStyles';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { Worksheet } from './types/worksheet';
import { GradeLevel, Topic } from './config/constants';

function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Form state
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | ''>('');
  const [topic, setTopic] = useState<Topic | ''>('');

  // Custom hooks with error handling
  const { serverPort, error: serverError } = useServerConnection();
  const { 
    worksheet, 
    error: worksheetError, 
    loading, 
    generateWorksheet 
  } = useWorksheetGenerator(serverPort);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Generate handler with validation
  const handleGenerate = () => {
    if (!serverPort) {
      console.error('Server connection not established');
      return;
    }
    if (!gradeLevel || !topic) {
      console.error('Grade level and topic are required');
      return;
    }
    generateWorksheet(gradeLevel, topic);
  };

  // Loading state component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <PrintStyles />
        
        <Navbar 
          darkMode={darkMode} 
          onToggleDarkMode={() => setDarkMode(!darkMode)} 
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {(serverError || worksheetError) && (
            <div className="no-print mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              {serverError || worksheetError}
            </div>
          )}

          <Suspense fallback={<LoadingSpinner />}>
            <WorksheetGenerator
              gradeLevel={gradeLevel}
              topic={topic}
              loading={loading}
              onGradeLevelChange={setGradeLevel}
              onTopicChange={setTopic}
              onGenerate={handleGenerate}
            />

            <WorksheetDisplay
              worksheet={worksheet as Worksheet | null}
              onPrint={handlePrint}
            />
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
