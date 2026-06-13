import React from 'react';

const AIInsights = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">AI Insights</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        AI-powered analysis and predictions from your log data
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Anomaly Detection</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              AI detects unusual patterns in your logs automatically
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">85% accuracy</div>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Predictive Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Forecast system issues before they impact performance
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">92% accuracy</div>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Root Cause Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Identify the source of issues with intelligent correlation
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">78% accuracy</div>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Pattern Recognition</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Discover recurring patterns and trends in your data
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '88%' }}></div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">88% accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
