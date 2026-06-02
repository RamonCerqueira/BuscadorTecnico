self.addEventListener('push', (event) => {
  let data = { title: 'TechFix', body: 'Você tem uma nova atualização!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'TechFix', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
    data: { link: data.link || '/dashboard' },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Visualizar Agora' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.link 
    ? new URL(event.notification.data.link, self.location.origin).href 
    : new URL('/dashboard', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and redirect
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open or focused on the URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
