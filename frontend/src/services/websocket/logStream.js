import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class LogWebSocket {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseURL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = localStorage.getItem('token');
    this.socket = io(this.baseURL, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      toast.success('Connected to live log stream');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Failed to connect to live stream');
      }
    });

    this.socket.on('new_log', (log) => {
      this.emit('new_log', log);
    });

    this.socket.on('alert_triggered', (alert) => {
      this.emit('alert_triggered', alert);
      toast.error(`Alert: ${alert.message}`, {
        duration: 5000,
      });
    });

    this.socket.on('anomaly_detected', (anomaly) => {
      this.emit('anomaly_detected', anomaly);
    });

    this.socket.on('system_health_update', (health) => {
      this.emit('system_health_update', health);
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  subscribeToLogs(filters = {}) {
    if (!this.socket?.connected) {
      this.connect();
    }
    this.socket.emit('subscribe_logs', filters);
  }

  unsubscribeFromLogs() {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_logs');
    }
  }

  subscribeToAlerts() {
    if (!this.socket?.connected) {
      this.connect();
    }
    this.socket.emit('subscribe_alerts');
  }

  unsubscribeFromAlerts() {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_alerts');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Singleton instance
const logWebSocket = new LogWebSocket();
export default logWebSocket;