'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Worksheet } from '@/types/worksheet';

interface WorksheetDisplayProps {
  worksheet: Worksheet | null;
  onPrint: () => void;
}

export const WorksheetDisplay = ({ worksheet, onPrint }: WorksheetDisplayProps) => {
  if (!worksheet) return null;

  return (
    <div className="mt-8">
      <div className="flex justify-end mb-4 no-print">
        <Button onClick={onPrint} variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print Worksheet
        </Button>
      </div>

      <div className="worksheet-content bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md print:shadow-none print:p-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {worksheet.title}
        </h1>

        <div className="reading-passage mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Reading Passage
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {worksheet.passage}
            </p>
          </div>
        </div>

        <div className="questions space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
              Multiple Choice Questions
            </h3>
            <div className="space-y-6">
              {worksheet.multipleChoice.map((q, i) => (
                <div key={i} className="question">
                  <p className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                    {i + 1}. {q.question}
                  </p>
                  <div className="options space-y-2 ml-4">
                    {q.options.map((option, j) => (
                      <div key={j} className="flex items-center space-x-2">
                        <span className="w-6 h-6 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center text-sm">
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
              Short Answer Questions
            </h3>
            <div className="space-y-6">
              {worksheet.shortAnswer.map((q, i) => (
                <div key={i} className="question">
                  <p className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                    {i + 1}. {q.question}
                  </p>
                  <div className="answer-space">
                    <div className="border-b-2 border-gray-300 dark:border-gray-600 h-8 mb-2"></div>
                    <div className="border-b-2 border-gray-300 dark:border-gray-600 h-8 mb-2"></div>
                    <div className="border-b-2 border-gray-300 dark:border-gray-600 h-8"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="answer-key mt-12 pt-8 border-t-2 border-gray-200 dark:border-gray-600 no-print">
          <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
            Answer Key
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                Multiple Choice Answers
              </h4>
              <div className="space-y-1">
                {worksheet.multipleChoice.map((q, i) => (
                  <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                    {i + 1}. {q.answer}
                  </p>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">
                Short Answer Suggestions
              </h4>
              <div className="space-y-2">
                {worksheet.shortAnswer.map((q, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {i + 1}. {q.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
