import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "@/store";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "highlight.js/styles/atom-one-dark.css";
import vue3GoogleLogin from "vue3-google-login";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "@/service/axios";

const vuetify = createVuetify({
  components,
  directives,
});

// 型定義を追加
declare global {
  interface Window {
    Echo: any;
    Pusher: any;
  }
}
// Pusherの設定
window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY, // Pusherのアプリキー
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER, // Pusherのクラスター
  forceTLS: true,
});

//Firebaseの設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FCM_API_KEY,
  authDomain: "yakyumare.firebaseapp.com",
  projectId: "yakyumare",
  storageBucket: "yakyumare.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FCM_SENDER_ID,
  appId: import.meta.env.VITE_FCM_APP_ID,
};

// Firebaseの初期化
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

// アプリケーションの作成
const app = createApp(App);

// 認証チェック
store
  .dispatch("checkAuthStatus")
  .then(() => {
    app
      .use(vuetify)
      .use(store)
      .use(router)
      .use(vue3GoogleLogin, {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      })
      .mount("#app");
  })
  .catch((error: any) => {
    console.error("Authentication check failed:", error);
    app
      .use(vuetify)
      .use(store)
      .use(router)
      .use(vue3GoogleLogin, {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      })
      .mount("#app");
  });

// TODO：動かない
// プッシュ通知の許可を求める関数
async function requestNotificationPermission() {
  try {
    const isLoggedIn = await store.dispatch("checkAuthStatus");
    if (isLoggedIn) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
        // プッシュ通知のトークンを取得
        const currentToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_VAPID_KEY,
        });
        if (currentToken) {
          console.log("Token received: ", currentToken);
          // サーバーにトークンを送信する処理を追加
          await axios.post("/notification-token", { token: currentToken });
        } else {
          console.log("No registration token available.");
        }
      } else {
        console.log("Notification permission denied.");
      }
    } else {
      console.log("ユーザーはログインしていません。");
    }
  } catch (error) {
    console.log("エラーが発生しました:", error);
  }
}

// ページが読み込まれたときに通知の許可を求める
requestNotificationPermission();

// メッセージを受信したときの処理
onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  if (payload.data) {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: "/yakyumare-icon.png",
    };

    if (Notification.permission === "granted") {
      const notification = new Notification(
        notificationTitle,
        notificationOptions
      );

      notification.onclick = (event) => {
        event.preventDefault();
        if (payload.data?.click_action) {
          window.open(payload.data.click_action, "_blank");
        }
      };
    }
  }
});
