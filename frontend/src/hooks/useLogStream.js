import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addLog } from '@store/slices/logSlice';
import { showNotification } from '@store/slices/uiSlice';

export const useLogStream = (filters = {}) => {
  const wsRef = useRef(null);
  const dispatch = useDispatch();

  const connectWebSocket = useCallback(() => {
    const query = new URLSearchParams(filters).toString();
    const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/logs/stream?${query}`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onmessage = (event) => {
      const logData = JSON.parse(event.data);
      dispatch(addLog(logData));
      
      // High severity notifications
      if (logData.severity === 'ERROR' || logData.severity === 'CRITICAL') {
        dispatch(showNotification({
          type: 'warning',
          message: `Critical Log: ${logData.message}`,
          timestamp: new Date().toISOString(),
        }));
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      setTimeout(connectWebSocket, 5000);
    };
  }, [filters, dispatch]);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  return { sendMessage: (msg) => wsRef.current?.send(msg) };
};