import React from 'react';
import { Card } from '../common/UI';
import { Search, Filter, Download, Settings, AlertCircle, RefreshCw } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    { icon: <Search />, label: 'Search Logs', color: 'blue' },
    { icon: <Filter />, label: 'Apply Filters', color: 'green' },
    { icon: <Download />, label: 'Export Data', color: 'purple' },
    { icon: <Settings />, label: 'Settings', color: 'gray' },
    { icon: <AlertCircle />, label: 'New Alert', color: 'red' },
    { icon: <RefreshCw />, label: 'Refresh', color: 'yellow' },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-4 rounded-lg bg-${action.color}-50 hover:bg-${action.color}-100 transition-colors`}
          >
            <div className={`text-${action.color}-600 mb-2`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;