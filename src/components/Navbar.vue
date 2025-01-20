<template>
  <div>
    <div
      v-if="showAlert"
      :class="[
        'alert',
        alertClass,
        'alert-dismissible',
        'position-fixed',
        'end-0',
        'translate-middle-y',
      ]"
      style="
        z-index: 1050;
        width: 350px;
        top: 100px;
        right: 20px;
        position: relative;
      "
      role="alert"
    >
      <button
        type="button"
        @click="dismissAlert"
        class="btn-close"
        aria-label="Close"
      ></button>
      <p class="mb-0">{{ alertMessage }}</p>
      <div
        v-if="loading"
        class="spinner-border spinner-border-sm"
        role="status"
      ></div>
      <a v-if="!loading" href="#" @click="resendVerification"
        >再送信はこちらから</a
      >
    </div>
    <div
      id="nav-bar"
      class="fixed-top border-bottom border-warning"
      ref="navbarElement"
    >
      <div class="bg-orange header-ws">
        <p class="mb-0 header-text title-inner">
          草野球専門の総合掲示板やきゅま~れ
        </p>
        <ul v-if="!$vuetify.display.mobile" class="header-nav mb-0">
          <li class="" v-if="!isLoggedIn">
            <router-link class="nav-link header-text" :to="{ name: 'Login' }"
              >ログイン</router-link
            >
          </li>
          <li class="" v-if="!isLoggedIn">
            <router-link
              class="nav-link header-text"
              :to="{ name: 'UserRegister' }"
              >アカウント作成</router-link
            >
          </li>
          <li class="" v-if="isLoggedIn">
            <router-link class="nav-link header-text" :to="{ name: 'MyPage' }"
              >マイページ</router-link
            >
          </li>
          <li class="" v-if="isLoggedIn">
            <a class="nav-link header-text" @click="logout">ログアウト</a>
          </li>
        </ul>
      </div>
      <nav class="navbar navbar-expand-lg navbar-dark bg-white">
        <div class="container-fluid">
          <router-link class="navbar-brand" to="/">
            <img
              src="/header-logo.webp"
              alt="やきゅま~れ"
              class="header-logo"
            />
          </router-link>
          <button
            class="navbar-toggler d-lg-none"
            type="button"
            aria-label="メニューを開く"
            @click="toggleMenu"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <router-link class="nav-link nav-text ml-6" to="/"
                  ><i class="bi bi-house-door"></i> ホーム</router-link
                >
              </li>
              <li class="nav-item">
                <router-link
                  class="nav-link nav-text ml-6"
                  to="/recruitment/list"
                  ><i class="bi bi-calendar-check"></i> 募集</router-link
                >
              </li>
              <li class="nav-item">
                <router-link class="nav-link nav-text ml-6" to="/message"
                  ><i class="bi bi-chat-dots"></i> メッセージ</router-link
                >
              </li>
              <li class="nav-item">
                <router-link class="nav-link nav-text ml-6" to="/contact"
                  ><i class="bi bi-envelope"></i> お問い合わせ</router-link
                >
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>

    <div class="content">
      <!-- 他のコンテンツをここに追加 -->
    </div>

    <div class="offcanvas" :class="{ show: isActive }" @click.self="toggleMenu">
      <div class="offcanvas-content">
        <ul class="navbar-nav">
          <li class="nav-item offcanvas-nav-item">
            <router-link
              class="nav-link offcanvas-nav-link"
              to="/"
              @click="toggleMenu"
              ><i class="bi bi-house-door"></i> ホーム</router-link
            >
          </li>
          <li class="nav-item offcanvas-nav-item border-top-0">
            <router-link
              class="nav-link offcanvas-nav-link"
              to="/recruitment/list"
              @click="toggleMenu"
              ><i class="bi bi-calendar-check"></i> 募集</router-link
            >
          </li>
          <li class="nav-item offcanvas-nav-item border-top-0">
            <router-link
              class="nav-link offcanvas-nav-link"
              to="/message"
              @click="toggleMenu"
              ><i class="bi bi-chat-dots"></i> メッセージ</router-link
            >
          </li>
          <li class="nav-item offcanvas-nav-item border-top-0">
            <router-link
              class="nav-link offcanvas-nav-link"
              to="/contact"
              @click="toggleMenu"
              ><i class="bi bi-envelope"></i> お問い合わせ</router-link
            >
          </li>
        </ul>
        <div class="d-flex justify-content-center" v-if="!isLoggedIn">
          <router-link
            class="btn btn-primary rounded-pill mt-2 w-50"
            :to="{ name: 'Login' }"
            @click="toggleMenu"
            >ログイン</router-link
          >
          <router-link
            class="btn btn-outline-warning rounded-pill mt-2 ml-1 w-50"
            :to="{ name: 'UserRegister' }"
            @click="toggleMenu"
            >アカウント作成</router-link
          >
        </div>
        <div class="d-flex justify-content-center" v-if="isLoggedIn">
          <router-link
            class="btn btn-primary rounded-pill mt-2 w-50"
            :to="{ name: 'MyPage' }"
            @click="toggleMenu"
            >マイページ</router-link
          >
          <router-link
            class="btn btn-outline-warning rounded-pill mt-2 ml-1 w-50"
            to="/"
            @click="logout"
            >ログアウト</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import axios from "@/service/axios";

const isActive = ref(false);
const showAlert = ref(false);
const store = useStore();
const loading = ref(false);
const alertMessage = ref("メールアドレスの認証が完了していません。");
const alertClass = ref("alert-danger");
const navbarElement = ref<HTMLElement | null>(null);

const isLoggedIn = computed(() => store.getters.isLoggedIn);

const toggleMenu = () => {
  isActive.value = !isActive.value;
};

const logout = async () => {
  await store.dispatch("logout");
  window.location.reload();
  toggleMenu();
};

const dismissAlert = () => {
  showAlert.value = false;
};

const user = ref<{ email_verified_at?: string } | null>(null);

const resendVerification = async () => {
  loading.value = true;
  alertMessage.value = "認証メールを送信しています...";
  alertClass.value = "alert-warning";

  try {
    await axios.post("/email/resend");
    loading.value = false;

    alertMessage.value = "認証メールを送信しました。";
    alertClass.value = "alert-success";
    setTimeout(() => {
      dismissAlert();
    }, 5000);
  } catch (error) {
    alertMessage.value = "エラーが発生しました。もう一度お試しください。";
    alertClass.value = "alert-danger";
  }
};

const getNavbarHeight = (): number => {
  return navbarElement.value ? navbarElement.value.offsetHeight : 0;
};

onMounted(async () => {
  if (isLoggedIn.value) {
    const response = await store.dispatch("checkAuthStatus");
    user.value = response.data;
    if (user.value && !user.value.email_verified_at) {
      showAlert.value = true;
    }
  }
});

defineExpose({ getNavbarHeight });
</script>

<style scoped>
.bg-orange {
  background-color: #ff8c00;
}
.header-ws {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 2px 0px;
}
.header-nav {
  list-style-type: none;
  display: flex;
}
.header-text {
  color: white;
  padding-left: 5px;
  padding-right: 5px;
  font-size: 1rem;
}
.navbar-brand {
  font-weight: bold;
  font-size: 2rem;
  color: #ff8c00 !important;
}

.header-logo {
  width: 200px;
  outline: none;
  border: none;
}
.nav-text {
  color: #ff8c00;
  font-size: 20px;
  font-weight: bold;
}
.nav-link {
  font-size: 16px;
  transition: color 0.3s;
}

.offcanvas-nav-item {
  width: 100%;
  border-top: solid 1px #ff8c00;
  border-bottom: solid 1px #ff8c00;
}

.offcanvas-nav-link {
  font-weight: bold;
  color: #ff8c00;
}
.nav-link:hover {
  color: #ffd700 !important;
}
.navbar-toggler-icon {
  filter: invert(1);
}

.offcanvas {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(30, 30, 30, 0.9);
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.offcanvas.show {
  transform: translateX(0);
}

.offcanvas-content {
  background-color: #ffffff;
  min-height: 50vh;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  text-align: center;
}

.content {
  padding-top: 85px;
}

.alert {
  opacity: 0.7;
}

.position-fixed {
  right: -300px;
}

@media (max-width: 992px) {
  .navbar-nav {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-logo {
    width: 150px !important;
  }
}
</style>
