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
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // 이미 열려있는 창이 있다면 포커스
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes("/") && "focus" in client) {
          return client.focus();
        }
      }
      // 열려있는 창이 없다면 앱 열기
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
