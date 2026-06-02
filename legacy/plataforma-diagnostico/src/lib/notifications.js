import { io } from 'socket.io-client';
import { useNotificationStore } from './store';

class NotificationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    try {
      this.socket = io('http://localhost:5000', {
        auth: {
          user_id: userId
        },
        transports: ['websocket', 'polling']
      });

      this.setupEventListeners();
      
      return new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          console.log('Conectado ao servidor de notificações');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Erro de conexão:', error);
          this.isConnected = false;
          reject(error);
        });
      });
    } catch (error) {
      console.error('Erro ao conectar:', error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Receber notificações
    this.socket.on('notification', (notification) => {
      console.log('Nova notificação recebida:', notification);
      
      // Adicionar à store
      const { addNotification } = useNotificationStore.getState();
      addNotification(notification);

      // Mostrar notificação do browser se permitido
      this.showBrowserNotification(notification);

      // Tocar som de notificação (opcional)
      this.playNotificationSound();
    });

    // Receber mensagens do chat
    this.socket.on('new_message', (message) => {
      console.log('Nova mensagem recebida:', message);
      
      // Emitir evento customizado para componentes que estão escutando
      window.dispatchEvent(new CustomEvent('newChatMessage', { 
        detail: message 
      }));
    });

    // Eventos de conexão
    this.socket.on('disconnect', (reason) => {
      console.log('Desconectado do servidor:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Reconectar se o servidor desconectou
        this.attemptReconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconectado após', attemptNumber, 'tentativas');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Erro de reconexão:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Máximo de tentativas de reconexão atingido');
      }
    });
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log('Tentando reconectar...');
        this.socket?.connect();
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Backoff exponencial
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Entrar na sala de um chamado específico
  joinTicketRoom(ticketId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_ticket_room', { ticket_id: ticketId });
    }
  }

  // Sair da sala de um chamado específico
  leaveTicketRoom(ticketId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_ticket_room', { ticket_id: ticketId });
    }
  }

  // Enviar mensagem no chat
  sendMessage(ticketId, message, senderId, senderName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        ticket_id: ticketId,
        message: message,
        sender_id: senderId,
        sender_name: senderName
      });
    }
  }

  // Mostrar notificação do browser
  async showBrowserNotification(notification) {
    if (!('Notification' in window)) {
      return;
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: false,
        silent: false
      });

      // Auto-fechar após 5 segundos
      setTimeout(() => {
        browserNotification.close();
      }, 5000);

      // Clique na notificação
      browserNotification.onclick = () => {
        window.focus();
        
        // Navegar para o chamado se for uma notificação relacionada
        if (notification.data?.ticket_id) {
          window.location.href = `/tickets/${notification.data.ticket_id}`;
        }
        
        browserNotification.close();
      };
    }
  }

  // Tocar som de notificação
  playNotificationSound() {
    try {
      // Criar um som simples usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Não foi possível tocar som de notificação:', error);
    }
  }

  // Verificar se está conectado
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// API para buscar notificações do servidor
export const notificationAPI = {
  async getNotifications(userId, page = 1, unreadOnly = false) {
    try {
      const params = new URLSearchParams({
        user_id: userId,
        page: page.toString(),
        per_page: '20'
      });

      if (unreadOnly) {
        params.append('unread_only', 'true');
      }

      const response = await fetch(`http://localhost:5000/api/notifications?${params}`);
      const data = await response.json();

      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'Erro ao buscar notificações');
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  },

  async markAsRead(notificationId) {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        return data.notification;
      } else {
        throw new Error(data.error || 'Erro ao marcar notificação como lida');
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  },

  async markAllAsRead(userId) {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      });

      const data = await response.json();

      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'Erro ao marcar todas as notificações como lidas');
      }
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  },

  async getStats(userId) {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/stats?user_id=${userId}`);
      const data = await response.json();

      if (data.success) {
        return data.stats;
      } else {
        throw new Error(data.error || 'Erro ao buscar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de notificações:', error);
      throw error;
    }
  }
};

// Instância singleton do serviço
export const notificationService = new NotificationService();

// Hook para usar notificações em componentes React
export const useNotifications = () => {
  const { 
    notifications, 
    unreadCount, 
    addNotification, 
    markAsRead, 
    markAllAsRead,
    setNotifications 
  } = useNotificationStore();

  const connectNotifications = async (userId) => {
    try {
      await notificationService.connect(userId);
      
      // Carregar notificações existentes
      const data = await notificationAPI.getNotifications(userId);
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Erro ao conectar notificações:', error);
    }
  };

  const disconnectNotifications = () => {
    notificationService.disconnect();
  };

  const loadMoreNotifications = async (userId, page) => {
    try {
      const data = await notificationAPI.getNotifications(userId, page);
      return data;
    } catch (error) {
      console.error('Erro ao carregar mais notificações:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      markAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllNotificationsAsRead = async (userId) => {
    try {
      await notificationAPI.markAllAsRead(userId);
      markAllAsRead();
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    connectNotifications,
    disconnectNotifications,
    loadMoreNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    joinTicketRoom: notificationService.joinTicketRoom.bind(notificationService),
    leaveTicketRoom: notificationService.leaveTicketRoom.bind(notificationService),
    sendMessage: notificationService.sendMessage.bind(notificationService),
    isConnected: notificationService.isSocketConnected.bind(notificationService)
  };
};

