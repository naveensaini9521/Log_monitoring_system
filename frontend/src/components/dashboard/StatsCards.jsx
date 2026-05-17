import React from 'react';
import { Card } from '../common/UI';
import { Activity, AlertTriangle, Database, Server } from 'lucide-react';

const StatsCards = () => {
  const stats = [
    { title: 'Total Logs', value: '1.2M', change: '+12%', icon: <Database />, color: 'blue' },
    { title: 'Active Alerts', value: '42', change: '-8%', icon: <AlertTriangle />, color: 'red' },
    { title: 'System Health', value: '98.7%', change: '+2.3%', icon: <Activity />, color: 'green' },
    { title: 'Uptime', value: '99.99%', change: '0%', icon: <Server />, color: 'purple' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from yesterday
              </p>
            </div>
            <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;