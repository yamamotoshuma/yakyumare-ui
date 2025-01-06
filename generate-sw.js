import fs from "fs";

const firebaseConfig = {
  apiKey: process.env.VITE_FCM_API_KEY,
  authDomain: "yakyumare.firebaseapp.com",
  projectId: "yakyumare",
  storageBucket: "yakyumare.firebasestorage.app",
  messagingSenderId: process.env.VITE_FCM_SENDER_ID,
  appId: process.env.VITE_FCM_APP_ID,
};

const content = `
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

const firebaseConfig = ${JSON.stringify(firebaseConfig)};

// Firebaseを初期化
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// バックグラウンドでメッセージを受信したときの処理
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received: ", payload);
  const { title, body, click_action } = payload.data;

  self.registration.showNotification(title, {
    body: body,
    icon: "/yakyumare-icon.png",
    data: { click_action },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.click_action || "/")
  );
});
`;

// firebase-messaging-sw.jsを`public`フォルダに書き込む
fs.writeFileSync("./public/firebase-messaging-sw.js", content, "utf8");
