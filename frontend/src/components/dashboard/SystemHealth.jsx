import React from 'react';
import { Card } from '../common/UI';
import { TrendingUp } from 'lucide-react';

const SystemHealth = () => {
  // Mock data for chart
  const healthData = [
    { hour: '00:00', health: 98 },
    { hour: '04:00', health: 97 },
    { hour: '08:00', health: 99 },
    { hour: '12:00', health: 98.5 },
    { hour: '16:00', health: 99.2 },
    { hour: '20:00', health: 98.8 },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">System Health Trend</h3>
        <div className="flex items-center text-green-600">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span>+2.3% from yesterday</span>
        </div>
      </div>
      <div className="h-64 flex items-end space-x-2">
        {healthData.map((data, index) => {
          const height = (data.health / 100) * 200;
          const color = data.health >= 99 ? 'bg-green-500' : 
                       data.health >= 97 ? 'bg-yellow-500' : 'bg-red-500';
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full ${color} rounded-t-lg transition-all duration-300`}
                style={{ height: `${height}px` }}
              ></div>
              <div className="text-xs text-gray-500 mt-2">{data.hour}</div>
              <div className="text-xs font-medium">{data.health}%</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SystemHealth;