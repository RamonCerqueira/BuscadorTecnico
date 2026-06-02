// Service Worker para TechFix PWA
const CACHE_NAME = 'techfix-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Recursos essenciais para cache
const ESSENTIAL_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Recursos da aplicação para cache
const APP_RESOURCES = [
  '/dashboard',
  '/tickets',
  '/new-ticket',
  '/login'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching essential resources');
        return cache.addAll(ESSENTIAL_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed:', error);
      })
  );
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Ignorar requisições para APIs externas
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estratégia Cache First para recursos estáticos
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.url.includes('/icons/') ||
      request.url.includes('/assets/')) {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Verificar se a resposta é válida
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clonar resposta para cache
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              
              return response;
            });
        })
        .catch(() => {
          // Retornar imagem placeholder se offline
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Imagem indisponível</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        })
    );
    return;
  }
  
  // Estratégia Network First para páginas da aplicação
  if (request.mode === 'navigate' || 
      (request.method === 'GET' && request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Verificar se a resposta é válida
          if (!response || response.status !== 200) {
            throw new Error('Network response was not ok');
          }
          
          // Clonar resposta para cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // Tentar buscar no cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Retornar página offline
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // Estratégia Network First para requisições da API
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Para requisições GET da API, cachear por um tempo limitado
          if (request.method === 'GET' && response.status === 200) {
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Adicionar timestamp para expiração
                const headers = new Headers(responseToCache.headers);
                headers.set('sw-cached-at', Date.now().toString());
                
                const cachedResponse = new Response(responseToCache.body, {
                  status: responseToCache.status,
                  statusText: responseToCache.statusText,
                  headers: headers
                });
                
                cache.put(request, cachedResponse);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Para requisições GET, tentar buscar no cache
          if (request.method === 'GET') {
            return caches.match(request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  // Verificar se o cache não está muito antigo (5 minutos)
                  const cachedAt = cachedResponse.headers.get('sw-cached-at');
                  if (cachedAt && (Date.now() - parseInt(cachedAt)) < 5 * 60 * 1000) {
                    return cachedResponse;
                  }
                }
                
                // Retornar resposta offline para API
                return new Response(
                  JSON.stringify({
                    success: false,
                    error: 'Sem conexão com a internet',
                    offline: true
                  }),
                  {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
              });
          }
          
          // Para outras requisições, retornar erro
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Sem conexão com a internet',
              offline: true
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
  
  if (event.tag === 'sync-tickets') {
    event.waitUntil(syncTickets());
  }
});

// Notificações push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  
  const options = {
    body: data.message || 'Nova notificação do TechFix',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'techfix-notification',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
        icon: '/icons/action-dismiss.png'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'TechFix', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'dismiss') {
    return;
  }
  
  // Determinar URL baseada nos dados da notificação
  let url = '/';
  
  if (data.ticket_id) {
    url = `/tickets/${data.ticket_id}`;
  } else if (data.url) {
    url = data.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verificar se já existe uma janela aberta
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Abrir nova janela se não encontrou
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Função para sincronizar chamados offline
async function syncTickets() {
  try {
    console.log('Service Worker: Syncing offline tickets...');
    
    // Buscar dados offline do IndexedDB ou localStorage
    const offlineTickets = await getOfflineTickets();
    
    for (const ticket of offlineTickets) {
      try {
        const response = await fetch('/api/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ticket)
        });
        
        if (response.ok) {
          // Remover ticket da fila offline
          await removeOfflineTicket(ticket.id);
          console.log('Service Worker: Ticket synced:', ticket.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync ticket:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Sync failed:', error);
  }
}

// Funções auxiliares para dados offline (implementação simplificada)
async function getOfflineTickets() {
  // Em uma implementação real, isso buscaria do IndexedDB
  return [];
}

async function removeOfflineTicket(ticketId) {
  // Em uma implementação real, isso removeria do IndexedDB
  console.log('Removing offline ticket:', ticketId);
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker: Loaded successfully');

