'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GRADE_LEVELS, TOPICS, GradeLevel, Topic } from '@/lib/constants';

interface WorksheetGeneratorProps {
  gradeLevel: GradeLevel | '';
  topic: Topic | '';
  loading: boolean;
  onGradeLevelChange: (level: GradeLevel | '') => void;
  onTopicChange: (topic: Topic | '') => void;
  onGenerate: () => void;
}

export const WorksheetGenerator = ({
  gradeLevel,
  topic,
  loading,
  onGradeLevelChange,
  onTopicChange,
  onGenerate,
}: WorksheetGeneratorProps) => {
  return (
    <div className="no-print space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Generate Worksheet
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="grade-level">Grade Level</Label>
          <Select value={gradeLevel} onValueChange={onGradeLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a grade level" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Select value={topic} onValueChange={onTopicChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((topicOption) => (
                <SelectItem key={topicOption} value={topicOption}>
                  {topicOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={!gradeLevel || !topic || loading}
        className="w-full md:w-auto"
        size="lg"
      >
        {loading ? 'Generating...' : 'Generate Worksheet'}
      </Button>

      {loading && (
        <div className="space-y-4 mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              Please wait, worksheet is being generated...
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-700 dark:text-blue-300">
              <span>Creating AI-powered content</span>
              <span>This may take 10-15 seconds</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 h-2.5 rounded-full animate-[loading-bar_2s_ease-in-out_infinite] bg-[length:200%_100%]"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700 dark:text-blue-300">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Analyzing grade level</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span>Generating content</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Creating questions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
