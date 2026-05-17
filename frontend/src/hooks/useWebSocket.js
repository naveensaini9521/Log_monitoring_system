// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Use VITE_WS_URL from .env if available, otherwise fallback to current host
    const baseWsUrl = import.meta.env.VITE_WS_URL;
    let wsUrl: string;

    if (baseWsUrl) {
      // Ensure no double slashes
      const cleanBase = baseWsUrl.replace(/\/$/, '');
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      wsUrl = `${cleanBase}${cleanPath}`;
    } else {
      // Determine protocol based on page protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}${url}`;
    }

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => setIsConnected(true);
    wsRef.current.onclose = () => setIsConnected(false);
    wsRef.current.onmessage = (event) => {
      try {
        setLastMessage(JSON.parse(event.data));
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    return () => wsRef.current?.close();
  }, [url]);

  const sendMessage = (data: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(data));
    }
  };

  return { isConnected, lastMessage, sendMessage };
};