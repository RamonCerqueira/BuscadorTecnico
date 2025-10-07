import { create } from 'zustand'

// Store para autenticação
export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  userType: null, // 'client', 'technician', 'company', 'admin'
  
  // Login automático para demonstração
  autoLogin: (userType = 'client') => {
    const mockUsers = {
      client: {
        id: 1,
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999',
        location: { lat: -23.5505, lng: -46.6333, address: 'São Paulo, SP' },
        avatar: null
      },
      technician: {
        id: 2,
        name: 'Carlos Técnico',
        email: 'carlos@tecnico.com',
        phone: '(11) 88888-8888',
        cnpj: null,
        validated: true,
        specialties: ['Celular', 'Notebook', 'TV'],
        location: { lat: -23.5505, lng: -46.6333, address: 'São Paulo, SP' },
        radius: 15,
        rating: 4.8,
        totalServices: 156,
        avatar: null
      },
      company: {
        id: 3,
        name: 'TechFix Assistência',
        email: 'contato@techfix.com',
        phone: '(11) 77777-7777',
        cnpj: '12.345.678/0001-90',
        website: 'https://techfix.com',
        specialties: ['Celular', 'Notebook', 'TV', 'Tablet'],
        location: { lat: -23.5505, lng: -46.6333, address: 'São Paulo, SP' },
        radius: 25,
        rating: 4.9,
        totalServices: 1250,
        logo: null
      },
      admin: {
        id: 4,
        name: 'Admin Sistema',
        email: 'admin@techfix.com',
        phone: '(11) 66666-6666',
        avatar: null
      }
    }
    
    set({
      user: mockUsers[userType],
      isAuthenticated: true,
      userType
    })
  },
  
  logout: () => set({ user: null, isAuthenticated: false, userType: null }),
  
  updateUser: (userData) => set(state => ({
    user: { ...state.user, ...userData }
  }))
}))

// Store para chamados
export const useTicketsStore = create((set, get) => ({
  tickets: [
    {
      id: 1,
      title: 'iPhone não carrega',
      description: 'Meu iPhone 12 parou de carregar ontem. Já tentei trocar o cabo e o carregador.',
      status: 'open', // open, in_progress, resolved, closed
      priority: 'high',
      deviceType: 'Celular',
      brand: 'Apple',
      model: 'iPhone 12',
      clientId: 1,
      clientName: 'João Silva',
      clientPhone: '(11) 99999-9999',
      location: { lat: -23.5505, lng: -46.6333, address: 'São Paulo, SP' },
      images: [],
      videos: [],
      audio: null,
      createdAt: new Date('2024-01-15T10:30:00'),
      updatedAt: new Date('2024-01-15T10:30:00'),
      assignedTo: null,
      responses: [],
      aiSuggestion: 'Problema comum em iPhone 12. Pode ser defeito no conector Lightning ou no CI de carga. Recomenda-se verificar se há sujeira no conector antes de abrir o aparelho.',
      estimatedCost: null,
      tags: ['carregamento', 'iphone', 'urgente']
    },
    {
      id: 2,
      title: 'Notebook não liga',
      description: 'Notebook Dell Inspiron não liga mais. LED de energia não acende.',
      status: 'in_progress',
      priority: 'medium',
      deviceType: 'Notebook',
      brand: 'Dell',
      model: 'Inspiron 15 3000',
      clientId: 5,
      clientName: 'Maria Santos',
      clientPhone: '(11) 88888-8888',
      location: { lat: -23.5505, lng: -46.6333, address: 'São Paulo, SP' },
      images: [],
      videos: [],
      audio: null,
      createdAt: new Date('2024-01-14T14:20:00'),
      updatedAt: new Date('2024-01-15T09:15:00'),
      assignedTo: { id: 2, name: 'Carlos Técnico', type: 'technician' },
      responses: [
        {
          id: 1,
          technicianId: 2,
          technicianName: 'Carlos Técnico',
          message: 'Vou verificar o problema. Pode ser fonte ou placa-mãe.',
          createdAt: new Date('2024-01-15T09:15:00'),
          estimatedCost: 'R$ 150,00 - R$ 300,00',
          visitScheduled: new Date('2024-01-16T14:00:00')
        }
      ],
      aiSuggestion: 'Problema pode estar relacionado à fonte de alimentação ou falha na placa-mãe. Teste com outra fonte antes de diagnosticar hardware.',
      estimatedCost: 'R$ 150,00 - R$ 300,00',
      tags: ['notebook', 'dell', 'não liga']
    }
  ],
  
  addTicket: (ticket) => set(state => ({
    tickets: [...state.tickets, { ...ticket, id: Date.now() }]
  })),
  
  updateTicket: (id, updates) => set(state => ({
    tickets: state.tickets.map(ticket => 
      ticket.id === id ? { ...ticket, ...updates, updatedAt: new Date() } : ticket
    )
  })),
  
  addResponse: (ticketId, response) => set(state => ({
    tickets: state.tickets.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            responses: [...ticket.responses, { ...response, id: Date.now() }],
            updatedAt: new Date()
          }
        : ticket
    )
  })),
  
  getTicketsByUser: (userId, userType) => {
    const tickets = get().tickets
    if (userType === 'client') {
      return tickets.filter(ticket => ticket.clientId === userId)
    } else if (userType === 'technician' || userType === 'company') {
      return tickets.filter(ticket => 
        ticket.assignedTo?.id === userId || 
        ticket.status === 'open'
      )
    } else if (userType === 'admin') {
      return tickets
    }
    return []
  }
}))

// Store para notificações
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  // Adicionar nova notificação
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1
  })),
  
  // Definir todas as notificações
  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.read).length
  }),
  
  // Marcar notificação como lida
  markAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  
  // Marcar todas como lidas
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  
  // Remover notificação
  removeNotification: (notificationId) => set((state) => {
    const notification = state.notifications.find(n => n.id === notificationId);
    return {
      notifications: state.notifications.filter(n => n.id !== notificationId),
      unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount
    };
  }),
  
  // Limpar todas as notificações
  clearNotifications: () => set({
    notifications: [],
    unreadCount: 0
  })
}))

// Store para notificações (compatibilidade)
export const useNotificationsStore = create((set, get) => ({
  notifications: [
    {
      id: 1,
      title: 'Novo chamado respondido',
      message: 'Carlos Técnico respondeu seu chamado sobre iPhone',
      type: 'info',
      read: false,
      createdAt: new Date('2024-01-15T09:15:00'),
      ticketId: 1
    },
    {
      id: 2,
      title: 'Chamado atualizado',
      message: 'Visita agendada para amanhã às 14h',
      type: 'success',
      read: false,
      createdAt: new Date('2024-01-15T09:20:00'),
      ticketId: 2
    }
  ],
  
  addNotification: (notification) => set(state => ({
    notifications: [{ ...notification, id: Date.now() }, ...state.notifications]
  })),
  
  markAsRead: (id) => set(state => ({
    notifications: state.notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    )
  })),
  
  markAllAsRead: () => set(state => ({
    notifications: state.notifications.map(notif => ({ ...notif, read: true }))
  })),
  
  getUnreadCount: () => {
    return get().notifications.filter(notif => !notif.read).length
  }
}))

// Store para configurações da aplicação
export const useAppStore = create((set) => ({
  theme: 'light',
  language: 'pt-BR',
  sidebarOpen: true,
  
  toggleTheme: () => set(state => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
  
  toggleSidebar: () => set(state => ({
    sidebarOpen: !state.sidebarOpen
  })),
  
  setLanguage: (language) => set({ language })
}))

