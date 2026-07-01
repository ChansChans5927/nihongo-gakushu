// public/sw.js
self.addEventListener("push", function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: "/vite.svg", // 사용할 아이콘 경로 (public 폴더 기준)
        badge: "/vite.svg",
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: "2",
          url: data.url,
          type: data.type,
          targetItem: data.targetItem,
          level: data.level
        },
      };
      event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (e) {
      console.error("Error parsing push payload", e);
      event.waitUntil(self.registration.showNotification(event.data.text()));
    }
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const clickData = event.notification.data;
  let targetUrl = "/";
  
  if (clickData && clickData.url) {
    targetUrl = clickData.url;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // 이미 열려있는 창이 있다면 포커스
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url && "focus" in client) {
          client.focus();
          
          if (clickData && clickData.targetItem) {
            client.postMessage({
              type: 'DEEP_LINK_STUDY',
              payload: clickData
            });
          } else if (targetUrl !== "/") {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // 열려있는 창이 없다면 앱 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
