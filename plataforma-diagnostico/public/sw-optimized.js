// Service Worker Otimizado para TechFix PWA
const CACHE_VERSION = '1.3.0';
const STATIC_CACHE = `techfix-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `techfix-dynamic-${CACHE_VERSION}`;
const API_CACHE = `techfix-api-${CACHE_VERSION}`;

// Recursos críticos (sempre em cache)
const CRITICAL_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Recursos da aplicação
const APP_RESOURCES = [
  '/app/dashboard',
  '/app/tickets',
  '/app/tickets/new',
  '/login',
  '/profile'
];

// APIs para cache
const CACHEABLE_APIS = [
  '/api/public/search',
  '/api/public/tags',
  '/api/public/problems'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      
      // Pre-cache algumas páginas importantes
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('[SW] Pre-caching app resources');
        return cache.addAll(APP_RESOURCES.slice(0, 2));
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Installation failed:', error);
    })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Apenas interceptar requisições GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Estratégias por tipo de recurso
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (isCriticalResource(url.pathname)) {
    event.respondWith(handleCriticalResource(request));
  } else if (isAppResource(url.pathname)) {
    event.respondWith(handleAppResource(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

// Verificar se é recurso crítico
function isCriticalResource(pathname) {
  return CRITICAL_RESOURCES.some(resource => 
    pathname === resource || pathname === resource + '/'
  );
}

// Verificar se é recurso da aplicação
function isAppResource(pathname) {
  return APP_RESOURCES.some(resource => 
    pathname.startsWith(resource)
  );
}

// Verificar se é asset estático
function isStaticAsset(request) {
  return request.destination === 'image' || 
         request.destination === 'style' || 
         request.destination === 'script' ||
         request.destination === 'font';
}

// Estratégia para APIs: Network First
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache apenas APIs públicas
      if (CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
        const cache = await caches.open(API_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] API network failed, trying cache:', url.pathname);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar resposta de erro estruturada
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Sem conexão - dados não disponíveis',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estratégia para recursos críticos: Cache First
async function handleCriticalResource(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Critical resource failed:', request.url);
    
    // Fallback para página offline se for documento
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Recurso não disponível offline', { status: 503 });
  }
}

// Estratégia para recursos da app: Network First com cache
async function handleAppResource(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] App resource network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para página offline
    return caches.match('/offline.html');
  }
}

// Estratégia para assets estáticos: Stale While Revalidate
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  // Retornar do cache imediatamente se disponível
  if (cachedResponse) {
    // Atualizar em background
    fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(request, networkResponse);
        });
      }
    }).catch(() => {
      // Ignorar erros de rede em background
    });
    
    return cachedResponse;
  }
  
  // Se não há cache, buscar da rede
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Asset não disponível offline', { status: 503 });
  }
}

// Estratégia genérica: Network First
async function handleGenericRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para página offline se for documento
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    
    return new Response('Recurso não disponível', { status: 503 });
  }
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(performBackgroundSync());
  }
});

async function performBackgroundSync() {
  try {
    console.log('[SW] Performing background sync');
    
    // Sincronizar dados pendentes
    const pendingData = await getStoredPendingData();
    
    if (pendingData.length > 0) {
      for (const data of pendingData) {
        try {
          await syncPendingData(data);
          await removePendingData(data.id);
        } catch (error) {
          console.error('[SW] Failed to sync data:', error);
        }
      }
    }
    
    // Atualizar cache com dados mais recentes
    await updateCacheWithFreshData();
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Funções auxiliares para sincronização
async function getStoredPendingData() {
  // Implementar lógica para obter dados pendentes do IndexedDB
  return [];
}

async function syncPendingData(data) {
  // Implementar lógica para sincronizar dados com servidor
  return fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

async function removePendingData(id) {
  // Implementar lógica para remover dados sincronizados do IndexedDB
}

async function updateCacheWithFreshData() {
  // Implementar lógica para atualizar cache com dados frescos
  const cache = await caches.open(API_CACHE);
  
  for (const api of CACHEABLE_APIS) {
    try {
      const response = await fetch(api);
      if (response.ok) {
        await cache.put(api, response);
      }
    } catch (error) {
      console.log('[SW] Failed to update cache for:', api);
    }
  }
}

// Notificações push
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let notificationData = {
    title: 'TechFix',
    body: 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png'
  };
  
  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.id || Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/action-close.png'
      }
    ],
    requireInteraction: false,
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Clique em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Se já há uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url === self.location.origin && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Caso contrário, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow('/app/dashboard');
        }
      })
    );
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
  } else {
    // Clique na notificação (não em ação específica)
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Tratamento de erros
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

