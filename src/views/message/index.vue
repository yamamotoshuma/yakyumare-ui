<template>
  <div :class="{ 'mobile-chat': isMobileChat }">
    <div
      class="container"
      :class="{ 'mobile-chat-container': isMobileChat, 'mt-2': !isMobile }"
      :style="containerStyle"
    >
      <div class="row" style="height: 100%">
        <!-- トーク一覧 -->
        <div
          class="col-md-4 chat-list"
          v-if="!isMobile || (isMobile && !selectedChat)"
        >
          <ul class="list-group mt-2">
            <li
              v-for="chat in chats"
              class="list-group-item d-flex justify-content-between align-items-center"
              @click="selectChat(chat)"
            >
              <img
                :src="getProfileUrl(chat.user)"
                class="user-avatar"
                alt="User Avatar"
              />
              <div class="chat-info">
                <strong>{{ chat.user.name }}</strong>
                <br />
                <small class="last-message text-truncate">{{
                  chat.lastMessage
                }}</small>
              </div>
              <span
                v-if="chat.unreadCount"
                class="badge bg-primary rounded-pill"
                >{{ chat.unreadCount }}</span
              >
            </li>
          </ul>
        </div>

        <!-- トーク画面 -->
        <div
          class="col-md-8 chat-window"
          v-if="!isMobile || (isMobile && selectedChat)"
        >
          <div v-if="selectedChat" class="chat-content">
            <div class="chat-header d-flex align-items-center">
              <!-- 戻るボタン(スマホ版のみ) -->
              <div v-if="isMobile" class="back-button mr-3">
                <i class="bi bi-arrow-left" @click="deselectChat"></i>
              </div>
              <img
                :src="getProfileUrl(selectedChat.user)"
                class="user-avatar-header"
                alt="User Avatar"
              />
              <h4>{{ selectedChat.user.name }}</h4>
            </div>
            <div
              v-if="
                selectedChat.applicationId &&
                selectedChat.application.recruited_user_id == userId &&
                selectedChat.application.approval == null
              "
              class="action-buttons"
            >
              <button class="btn btn-primary mr-2" @click="showApproveModal">
                {{ selectedChat.application.approval }} 応募の承認
              </button>
              <button class="btn btn-danger" @click="showRejectModal">
                応募の否認
              </button>
            </div>
            <div
              v-else-if="
                selectedChat.applicationId &&
                selectedChat.application.approval == true
              "
              class="action-buttons"
            >
              <div class="alert alert-success" role="alert">
                この応募は承認されました
              </div>
            </div>
            <div
              v-else-if="
                selectedChat.applicationId &&
                selectedChat.application.approval == false
              "
              class="action-buttons"
            >
              <div class="alert alert-danger" role="alert">
                この応募は否認されました
              </div>
            </div>
            <div class="messages" ref="messagesContainer">
              <template
                v-for="(messageGroup, date) in groupedMessages"
                :key="date"
              >
                <div class="date-divider">
                  <span class="date">{{ date }}</span>
                </div>
                <div
                  v-for="message in messageGroup"
                  :key="message.id"
                  class="message-item"
                  :class="{
                    'my-message': message.senderId === userId,
                    'their-message':
                      message.senderId !== userId &&
                      message.senderId !== 'system',
                    'system-message': message.senderId === 'system',
                  }"
                >
                  <div class="message-content">
                    <div v-if="message.senderId === userId">
                      <div v-if="message.readCount > 0" class="message-time">
                        既読{{ message.readCount > 1 ? message.readCount : "" }}
                      </div>
                      <div class="message-time">
                        {{ formatTime(message.createdDate) }}
                      </div>
                    </div>
                    <div class="message-bubble">
                      {{ message.content }}
                    </div>

                    <div
                      v-if="
                        message.senderId !== userId &&
                        message.senderId !== 'system'
                      "
                      class="message-time"
                    >
                      {{ formatTime(message.createdDate) }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <div class="input-area">
              <textarea
                v-model="newMessage"
                class="form-control custom-textarea"
                placeholder="メッセージを入力"
                :rows="isMobile ? 1 : 3"
                @input="autoGrow"
                @keydown.alt.enter.exact.prevent="sendMessage"
                @keydown.ctrl.enter.exact.prevent="sendMessage"
                ref="messageInput"
              ></textarea>
              <button class="btn btn-primary send-button" @click="sendMessage">
                <i class="bi bi-send"></i>
              </button>
            </div>
          </div>
          <div v-else class="chat-placeholder">
            <p>トークを選択してください。</p>
          </div>
        </div>
      </div>
    </div>
    <LoadingScreen v-show="load" />
    <!-- 承認確認モーダル -->
    <Modal
      v-if="showModal"
      :title="modalTitle"
      :bodyText="modalBodyText"
      @closeModal="closeModal"
      @confirmAction="confirmAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch, onUnmounted } from "vue";
import axios from "@/service/axios";
import LoadingScreen from "@/components/LoadingScreen.vue";
import Modal from "@/components/Modal.vue";
import store from "@/store";
import { getProfileUrl } from "@/service/profileImage";

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Message {
  id: number;
  senderId: string;
  content: string;
  createdDate: string;
  readCount: number;
}

interface Chat {
  id: string;
  applicationId: string;
  application: Application;
  user: User;
  lastMessage: string;
  unreadCount: number;
}

interface Application {
  id: string;
  recruitment_id: string;
  recruited_user_id: string;
  apply_user_id: string;
  approval: boolean;
}

const isMobile = ref(false);
const selectedChat = ref<Chat | null>(null);
const chats = ref<Chat[]>([]);
const messages = ref<Message[]>([]);
const userId = ref("");
const newMessage = ref("");
const navbarHeight = ref(0);
const load = ref(false);
const messageInput = ref<HTMLTextAreaElement | null>(null);
const messagesContainer = ref<HTMLDivElement | null>(null);

const showModal = ref(false);
const modalTitle = ref("");
const modalBodyText = ref("");
const modalAction = ref<"approve" | "reject" | null>(null);

const isMobileChat = computed(() => {
  return isMobile.value && selectedChat.value !== null;
});

const containerStyle = computed(() => {
  if (isMobileChat.value) {
    return { height: `calc(100vh - ${navbarHeight.value}px)`, margin: 0 };
  } else {
    return { height: `calc(100vh - ${navbarHeight.value}px)` };
  }
});

const groupedMessages = computed(() => {
  const groups: { [key: string]: Message[] } = {};
  messages.value.forEach((message) => {
    const date = new Date(message.createdDate).toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });
  return groups;
});

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const applyGlobalStyles = () => {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  if (isMobileChat.value) {
    document.body.style.margin = "0";
  } else {
    document.body.style.margin = "";
  }
};

onMounted(async () => {
  // 初期表示時最上段にスクロール
  window.scrollTo(0, 0);

  selectedChat.value = null;
  const res = await axios.get("talk");
  chats.value = res.data;

  const response = await store.dispatch("checkAuthStatus");
  userId.value = response.data.id;

  window.Echo.channel(import.meta.env.VITE_PUSER_CHANNEL).listen(
    "MessageSent",
    handleMessageSent
  );

  window.Echo.channel(import.meta.env.VITE_PUSER_CHANNEL).listen(
    "SetRead",
    handleSetRead
  );

  isMobile.value = window.innerWidth <= 768;
  window.addEventListener("resize", handleResize);

  nextTick(() => {
    updateNavbarHeight();
    applyGlobalStyles();
  });
});

const handleMessageSent = async (e: any) => {
  console.log(e);
  const chat = chats.value.find(
    (chatItem) => chatItem.id === e.message.talk_id
  );

  if (chat) {
    if (
      selectedChat.value &&
      e.message.talk_id == selectedChat.value.id &&
      e.message.send_user_id != userId.value
    ) {
      const newMsg: Message = {
        id: e.message.id,
        senderId: e.message.send_user_id,
        content: e.message.message,
        createdDate: e.message.created_at,
        readCount: e.message.read_count,
      };
      messages.value.push(newMsg);

      nextTick(() => {
        scrollToBottom();
      });

      await setRead(selectedChat.value);

      const res = await axios.get("talk");
      chats.value = res.data;
    } else {
      const res = await axios.get("talk");
      chats.value = res.data;
    }
  }
};

const handleSetRead = async (e: any) => {
  const chat = chats.value.find((chatItem) => chatItem.id === e.talkId);
  if (chat) {
    if (selectedChat.value && e.talkId == selectedChat.value.id) {
      messages.value = await fetchMessages(selectedChat.value.id);
      nextTick(() => {
        scrollToBottom();
      });
    } else {
      const res = await axios.get("talk");
      chats.value = res.data;
    }
  }
};

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  selectedChat.value = null;
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.margin = "";
});

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  updateNavbarHeight();
  applyGlobalStyles();
};

const updateNavbarHeight = () => {
  nextTick(() => {
    const navbar = document.getElementById("nav-bar");
    if (navbar) {
      navbarHeight.value = navbar.clientHeight;
    }
  });
};

watch([isMobile, selectedChat], () => {
  updateNavbarHeight();
  applyGlobalStyles();
});

const selectChat = async (chat: Chat) => {
  selectedChat.value = chat;
  load.value = true;
  try {
    messages.value = await fetchMessages(chat.id);
    nextTick(() => {
      scrollToBottom();
    });
    // メッセージを読んだ時に未読カウントを1にする
    load.value = false;
    await setRead(chat);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
  }
};

const deselectChat = () => {
  selectedChat.value = null;
  messages.value = [];
};

const autoGrow = () => {
  if (messageInput.value) {
    messageInput.value.style.height = "auto";
    messageInput.value.style.height = messageInput.value.scrollHeight + "px";
  }
};

const setRead = async (chat: Chat) => {
  console.log("チャット", chat);
  const data = {
    talk_id: chat.id,
    user_id: chat.user.id,
  };
  await axios.post("message/set-read", data);
  const res = await axios.get("talk");
  chats.value = res.data;
};

const sendMessage = async () => {
  try {
    if (selectedChat.value && newMessage.value.trim() !== "") {
      const val = newMessage.value;
      const newMsg: Message = {
        id: messages.value.length + 1,
        senderId: userId.value,
        content: val,
        createdDate: new Date().toISOString(),
        readCount: 0,
      };
      messages.value.push(newMsg);
      newMessage.value = "";
      if (messageInput.value) {
        messageInput.value.style.height = "auto";
      }

      autoGrow();
      nextTick(() => {
        scrollToBottom();
      });

      const sendMessage = {
        talk_id: selectedChat.value.id,
        user_id: userId.value,
        message: val,
      };

      await axios.post("messages", sendMessage);
      messages.value = await fetchMessages(selectedChat.value.id);

      autoGrow();
      nextTick(() => {
        scrollToBottom();
      });
    }
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const fetchMessages = async (chatId: string): Promise<Message[]> => {
  const res = await axios.get(`messages/${chatId}`);
  return res.data;
};

const showApproveModal = () => {
  modalTitle.value = "承認の確認";
  modalBodyText.value = "この応募を承認してもよろしいですか？";
  modalAction.value = "approve";
  showModal.value = true;
};

const showRejectModal = () => {
  modalTitle.value = "否認の確認";
  modalBodyText.value = "この応募を否認してもよろしいですか？";
  modalAction.value = "reject";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  modalAction.value = null;
};

const confirmAction = async () => {
  load.value = true;
  if (modalAction.value === "approve") {
    await updateApproval(selectedChat.value?.applicationId!, true);
    console.log("応募が承認されました");
  } else if (modalAction.value === "reject") {
    await updateApproval(selectedChat.value?.applicationId!, false);
    console.log("応募が否認されました");
  }
  closeModal();
  load.value = false;
  window.location.reload();
};

// Start of Selection
const updateApproval = async (id: string, approval: boolean) => {
  try {
    const data = {
      id: id,
      approval: approval,
    };
    return await axios.put("approval", data);
  } catch (e) {
    alert("承認の更新に失敗しました");
    console.error("承認の更新に失敗しました:", e);
    load.value = false;
  }
};
</script>

<style scoped>
.container {
  margin-top: 0;
  background-color: #f9f9f9;
}

.mobile-chat-container {
  margin: 0;
  padding: 0;
  max-width: 100%;
}

.chat-list {
  border-right: 1px solid #ddd;
  height: 100%;
  overflow-y: auto;
}

.last-message {
  display: inline-block;
  max-width: 200px;
}

.list-group-item {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.list-group-item:hover {
  background-color: #e9ecef;
}

.user-avatar {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
}

.user-avatar-header {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 15px;
}

.chat-info {
  flex: 1;
}

.chat-window {
  height: 100%;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.chat-header {
  background-color: #ffffff;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #e5ddd5;
}

.message-item {
  margin-bottom: 15px;
  display: flex;
}

.message-bubble {
  padding: 12px 18px;
  border-radius: 18px;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.my-message {
  justify-content: flex-end;
}

.my-message .message-bubble {
  background-color: #dcf8c6;
  color: #000000;
}

.their-message .message-bubble {
  background-color: #ffffff;
  color: #000000;
}

.system-message {
  justify-content: center;
}

.system-message .message-bubble {
  background-color: #f0f0f0;
  color: #000000;
}

.back-button {
  font-size: 24px;
  cursor: pointer;
  margin-right: 10px;
}

.input-area {
  display: flex;
  align-items: flex-end;
  padding: 15px;
  background-color: #f0f0f0;
  border-top: 1px solid #e0e0e0;
}

.custom-textarea {
  flex-grow: 1;
  resize: none;
  overflow: hidden;
  min-height: 38px;
  max-height: 120px;
  padding: 10px 15px;
  line-height: 1.5;
  border-radius: 20px;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.send-button {
  margin-left: 10px;
  padding: 10px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background-color: #007bff;
  border: none;
}

.send-button:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.send-button i {
  font-size: 1.2rem;
}

.mobile-chat {
  z-index: 1000;
  background-color: white;
}

.action-buttons {
  padding-top: 10px;
  background-color: #e5ddd5;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.action-buttons .btn {
  padding: 5px 10px;
  font-size: 0.9rem;
}

.date-divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.date-divider .date {
  background-color: #e5ddd5;
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 0.9em;
  color: #666;
}
.message-time {
  font-size: 0.8em;
  color: #666;
  text-align: right;
  margin-right: 5px;
  margin-left: 5px;
}

.message-content {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}

@media (max-width: 768px) {
  .input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .messages {
    padding-bottom: 80px;
  }

  .custom-textarea {
    min-height: 40px;
    max-height: 100px;
  }
}
</style>
