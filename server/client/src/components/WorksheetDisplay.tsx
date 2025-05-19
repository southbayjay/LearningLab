import { PrinterIcon } from '@heroicons/react/24/outline';

interface WorksheetData {
  title: string;
  passage: string;
  multipleChoice: {
    question: string;
    options: string[];
    answer: string;
  }[];
  shortAnswer: {
    question: string;
    answer: string;
  }[];
}

interface WorksheetDisplayProps {
  worksheet: WorksheetData | null;
  onPrint: () => void;
}

export const WorksheetDisplay = ({ worksheet, onPrint }: WorksheetDisplayProps) => {
  if (!worksheet) return null;

  return (
    <div className="mt-8">
      <div className="flex justify-end mb-4 no-print">
        <button
          onClick={onPrint}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          <PrinterIcon className="h-5 w-5 mr-2" />
          Print Worksheet
        </button>
      </div>

      <div className="worksheet-content bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {worksheet.title}
        </h1>

        <div className="reading-passage prose dark:prose-invert max-w-none mb-8">
          <h3 className="text-lg font-semibold mb-2">Reading Passage</h3>
          <p className="whitespace-pre-wrap">{worksheet.passage}</p>
        </div>

        <div className="questions space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Multiple Choice Questions</h3>
            {worksheet.multipleChoice.map((q, i) => (
              <div key={i} className="question mb-4">
                <p className="mb-2">
                  {i + 1}. {q.question}
                </p>
                <div className="options space-y-2 ml-4">
                  {q.options.map((option, j) => (
                    <div key={j} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name={`question-${i}`}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Short Answer Questions</h3>
            {worksheet.shortAnswer.map((q, i) => (
              <div key={i} className="question mb-4">
                <p className="mb-2">
                  {worksheet.multipleChoice.length + i + 1}. {q.question}
                </p>
                <div className="short-answer-space border border-gray-300 dark:border-gray-600 rounded-md h-32"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="answer-key mt-8 print:page-break-before-always">
          <h3 className="text-lg font-semibold mb-4">Answer Key</h3>
          <div className="space-y-2">
            <h4 className="font-medium">Multiple Choice Answers:</h4>
            {worksheet.multipleChoice.map((q, i) => (
              <p key={i}>
                {i + 1}. {q.answer}
              </p>
            ))}
          </div>
          <div className="space-y-2 mt-4">
            <h4 className="font-medium">Short Answer Responses:</h4>
            {worksheet.shortAnswer.map((q, i) => (
              <div key={i}>
                <p className="font-medium">
                  {worksheet.multipleChoice.length + i + 1}. {q.question}
                </p>
                <p className="ml-4">{q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
