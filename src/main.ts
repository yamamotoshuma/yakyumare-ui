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

// プッシュ通知の許可を求める関数
async function requestNotificationPermission() {
  try {
    const isLoggedIn = await store.dispatch("checkAuthStatus");
    if (isLoggedIn) {
      showPreOptInUI();
    } else {
      console.log("ユーザーはログインしていません。");
    }
  } catch (error) {
    console.log("エラーが発生しました:", error);
  }
}

// プッシュ通知登録
async function notification() {
  try {
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

function showPreOptInUI() {
  if (Notification.permission === "granted") {
    return; // 許可されている場合、UIを表示しない
  }
  // プレオプトインUIの作成
  const preOptInContainer = document.createElement("div");
  preOptInContainer.style.position = "fixed";
  preOptInContainer.style.bottom = "20px";
  preOptInContainer.style.right = "20px";
  preOptInContainer.style.width = "300px";
  preOptInContainer.style.padding = "20px";
  preOptInContainer.style.backgroundColor = "#ffffff";
  preOptInContainer.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
  preOptInContainer.style.borderRadius = "10px";
  preOptInContainer.style.zIndex = "1000";
  preOptInContainer.style.fontFamily = "'Roboto', sans-serif";
  preOptInContainer.style.animation = "fadeIn 0.3s ease-in-out";

  // フェードインのアニメーションを追加
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(
    `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
    styleSheet.cssRules.length
  );

  // メッセージ部分
  const message = document.createElement("p");
  message.textContent = "🔔 プッシュ通知を有効にして最新情報を受け取りますか？";
  message.style.margin = "0 0 15px";
  message.style.fontSize = "14px";
  message.style.color = "#333";
  message.style.lineHeight = "1.5";

  // ボタンのコンテナ
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between";

  // 許可ボタン
  const allowButton = document.createElement("button");
  allowButton.textContent = "許可する";
  allowButton.style.padding = "10px 20px";
  allowButton.style.backgroundColor = "#4CAF50";
  allowButton.style.color = "#ffffff";
  allowButton.style.border = "none";
  allowButton.style.borderRadius = "5px";
  allowButton.style.cursor = "pointer";
  allowButton.style.fontSize = "14px";
  allowButton.style.transition = "background-color 0.3s ease";
  allowButton.style.boxShadow = "0 4px 10px rgba(76, 175, 80, 0.2)";
  allowButton.addEventListener("mouseover", () => {
    allowButton.style.backgroundColor = "#45a049";
  });
  allowButton.addEventListener("mouseout", () => {
    allowButton.style.backgroundColor = "#4CAF50";
  });

  // 後でボタン
  const denyButton = document.createElement("button");
  denyButton.textContent = "後で";
  denyButton.style.padding = "10px 20px";
  denyButton.style.backgroundColor = "#f44336";
  denyButton.style.color = "#ffffff";
  denyButton.style.border = "none";
  denyButton.style.borderRadius = "5px";
  denyButton.style.cursor = "pointer";
  denyButton.style.fontSize = "14px";
  denyButton.style.transition = "background-color 0.3s ease";
  denyButton.style.boxShadow = "0 4px 10px rgba(244, 67, 54, 0.2)";
  denyButton.addEventListener("mouseover", () => {
    denyButton.style.backgroundColor = "#e53935";
  });
  denyButton.addEventListener("mouseout", () => {
    denyButton.style.backgroundColor = "#f44336";
  });

  // ボタンのイベントリスナー
  allowButton.addEventListener("click", async () => {
    document.body.removeChild(preOptInContainer);
    await notification();
  });

  denyButton.addEventListener("click", () => {
    document.body.removeChild(preOptInContainer);
  });

  // 要素を組み立ててDOMに追加
  buttonContainer.appendChild(allowButton);
  buttonContainer.appendChild(denyButton);
  preOptInContainer.appendChild(message);
  preOptInContainer.appendChild(buttonContainer);
  document.body.appendChild(preOptInContainer);
}
