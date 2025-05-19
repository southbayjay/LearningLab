// @ts-ignore - Ignore type errors for Heroicons
import { BookOpenIcon, SunIcon, MoonIcon } from '@heroicons/react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar = ({ darkMode, onToggleDarkMode }: NavbarProps) => {
  return (
    <nav className="no-print bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              LearningLab
            </h1>
          </div>
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6" />
            ) : (
              <MoonIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
