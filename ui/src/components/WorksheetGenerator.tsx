import { GRADE_LEVELS, TOPICS } from '../config/constants';

interface WorksheetGeneratorProps {
  gradeLevel: string;
  topic: string;
  loading: boolean;
  onGradeLevelChange: (level: string) => void;
  onTopicChange: (topic: string) => void;
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
    <div className="no-print space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="grade-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Grade Level
          </label>
          <select
            id="grade-level"
            value={gradeLevel}
            onChange={(e) => onGradeLevelChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select a grade level</option>
            {GRADE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Topic
          </label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select a topic</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Worksheet'
          )}
        </button>
      </div>
    </div>
  );
};
