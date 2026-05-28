import React, { useState, useEffect } from 'react';
import { Card } from '../common/UI';
import { Clock, Zap } from 'lucide-react';

const RealTimeLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Simulate real-time log updates
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        service: ['API Gateway', 'Database', 'Cache', 'Auth Service'][Math.floor(Math.random() * 4)],
        level: ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)],
        message: 'Processing request...',
      };
      setLogs(prev => [newLog, ...prev.slice(0, 10)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Zap className="w-5 h-5 text-yellow-500 mr-2" />
          Real-time Logs
        </h3>
        <div className="flex items-center text-green-500 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          Live
        </div>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.map(log => (
          <div key={log.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                  log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {log.level}
                </span>
                <span className="font-medium truncate">{log.service}</span>
                <span className="text-gray-500 text-sm truncate">{log.message}</span>
              </div>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RealTimeLogs;