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
    </div>
  );
};
