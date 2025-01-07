<template>
  <div>
    <Navbar />
    <div class="container" v-if="recruitment">
      <div
        v-if="
          !recruitment.active ||
          new Date(recruitment.deadline) < new Date() ||
          approvalCount >= recruitment.capacity
        "
        class="alert alert-danger text-center"
      >
        募集が終了しました。
      </div>
      <div
        class="header d-flex justify-content-between align-items-center mb-4"
      >
        <h2 class="recruitment-title mb-0">{{ recruitment.title }}</h2>
      </div>
      <div class="card mb-4">
        <div class="card-body">
          <div class="recruitment-info">
            <div class="info-item">
              <strong>募集者:</strong>
              <router-link
                style="color: black; text-decoration: none"
                :to="{ name: 'Users', params: { id: recruitment.user.id } }"
              >
                <img
                  :src="getProfileUrl(recruitment.user)"
                  alt="User Avatar"
                  class="user-avatar"
                />&nbsp;
                <span>{{ recruitment.user.name }}</span>
              </router-link>
            </div>
            <div class="info-item">
              <strong>開催日:</strong>
              {{ formatDate(recruitment.event_date) }}
              {{ formatTime(recruitment.event_date) }}
            </div>
            <div class="info-item">
              <strong>応募締切:</strong> 残り{{ remainingDays }}日 (締切日:
              {{ formatDate(recruitment.deadline) }}
              {{ formatTime(recruitment.deadline) }}
              )
            </div>
            <div class="info-item">
              <strong>エリア:</strong> {{ recruitment.prefecture }},
              {{ recruitment.city }}
            </div>
            <div class="info-item">
              <strong>会場:</strong> {{ recruitment.place }}
            </div>
            <div class="info-item">
              <strong>定員:</strong>
              {{
                `${recruitment.capacity} (応募:${applicationCount} 承認:${approvalCount})`
              }}
            </div>
            <div class="info-item">
              <strong>種類:</strong> {{ recruitment.type.name }}
            </div>
            <div class="info-item">
              <strong>募集ID:</strong> {{ recruitment.id }}
            </div>
          </div>
          <div class="recruitment-content mt-4">
            <h4>本文</h4>
            <p>{{ recruitment.content }}</p>
          </div>
        </div>
      </div>
      <div class="card-bottom">
        <button
          v-if="
            user &&
            user.id != recruitment.user.id &&
            !hasApplicationByApplyUserId(recruitment.applications)
          "
          class="btn btn-primary apply-btn bottom-btn"
          @click="openModal"
          :disabled="
            !recruitment.active ||
            new Date(recruitment.deadline) < new Date() ||
            approvalCount >= recruitment.capacity
          "
        >
          応募する
        </button>
        <router-link
          v-else-if="user && user.id == recruitment.user.id"
          class="btn btn-primary apply-btn bottom-btn"
          :to="{ name: 'RecruitmentEdit', params: { id: recruitment.id } }"
        >
          修正する
        </router-link>
        <router-link
          v-else-if="
            user && hasApplicationByApplyUserId(recruitment.applications)
          "
          class="btn btn-primary apply-btn bottom-btn"
          :to="{ name: 'message' }"
        >
          メッセージ
        </router-link>
        <div class="text-center mt-3" v-else>
          募集に応募するにはログインしてください
        </div>
      </div>
      <div class="comments-section">
        <h3 class="mb-3">
          <i class="bi bi-chat-right-text" aria-hidden="true"></i>
          コメント
        </h3>
        <CommentList :comments="comments" />
        <CommentForm :user_id="user ? user.id : null" @submit="submitComment" />
      </div>
    </div>
    <LoadingScreen v-show="load" />
    <Modal
      v-if="showModal"
      :title="modalTitle"
      :bodyText="modalBodyText"
      @closeModal="closeModal"
      @confirmAction="apply"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/service/axios";
import Navbar from "@/components/Navbar.vue";
import CommentList from "@/components/CommentList.vue";
import CommentForm from "@/components/CommentForm.vue";
import LoadingScreen from "@/components/LoadingScreen.vue";
import store from "@/store";
import { createApiError } from "@/service/errorService";
import { getProfileUrl } from "@/service/profileImage";
import Modal from "@/components/Modal.vue";

const route = useRoute();
const router = useRouter();
const recruitment = ref(null);
const user = ref(null);
const load = ref(false);
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const comments = ref([]);
const showModal = ref(false);
const modalTitle = "応募";
const modalBodyText = "この募集に応募します。\nよろしいですか？";
const applicationCount = computed(
  () => recruitment.value?.applications?.length || 0
);
const approvalCount = computed(
  () =>
    recruitment.value?.applications?.filter(
      (application) => application.status === "approved"
    ).length || 0
);

onMounted(async () => {
  try {
    // 応募取得
    const response = await axios.get(`recruitment/${route.params.id}`);
    recruitment.value = response.data;

    // コメント取得
    const commentRes = await axios.get("comment", {
      params: {
        recruitment_id: recruitment.value.id,
      },
    });
    comments.value.push(...commentRes.data);

    // ログインユーザ取得
    const userRes = await store.dispatch("checkAuthStatus");
    user.value = userRes.data.id ? userRes.data : null;
  } catch (e) {
    console.log(e);
  }
});

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (dateString) => {
  const options = { hour: "2-digit", minute: "2-digit" };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};

const remainingDays = computed(() => {
  const deadline = new Date(recruitment.value.deadline);
  const now = new Date();
  const difference = deadline - now;
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
});

const closeModal = () => {
  showModal.value = false;
};

const openModal = async () => {
  showModal.value = true;
};

const apply = async () => {
  // 応募処理
  closeModal();
  try {
    load.value = true;
    const data = {
      recruitment_id: recruitment.value.id,
      recruited_user_id: recruitment.value.user.id,
      apply_user_id: user.value.id,
    };
    await axios.post(`application`, data);
    router.push("/message");
  } catch (e) {
    alert("応募に失敗しました。");
  } finally {
    load.value = false;
  }
};

const submitComment = async (content) => {
  try {
    // コメントをAPIに送信
    await axios.post("comment", {
      recruitment_id: recruitment.value.id,
      user_id: user.value.id,
      content: content.value,
    });

    window.location.reload();
  } catch (error) {
    alert(createApiError(error));
  }
};

// 特定のapply_user_idが存在するかを確認する関数
function hasApplicationByApplyUserId(applications) {
  return applications.some(
    (application) => application.apply_user_id === user.value.id
  );
}
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
  color: #333;
  font-family: "Helvetica Neue", sans-serif;
}

.header {
  border-bottom: 2px solid #e07b00;
  padding-bottom: 10px;
}

.recruitment-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
}

.apply-btn {
  background-color: #00a2ff;
  border-color: #00a2ff;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 10px 20px;
  transition: background-color 0.3s, border-color 0.3s, transform 0.3s;
  transform: scale(1);
}

.card-bottom {
  text-align: center;
}

.apply-btn:hover {
  background-color: #0031e0;
  border-color: #0031e0;
  transform: scale(1.05);
}

.card {
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-body {
  background: linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%);
  padding: 30px;
  border-radius: 15px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  margin-left: 10px;
  border: 2px solid #ff8c00;
}

.recruitment-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.info-item {
  flex: 1 1 45%;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.info-item strong {
  margin-right: 10px;
}

.recruitment-content {
  margin-top: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recruitment-content h4 {
  margin-bottom: 15px;
  color: #333;
}

.comments-section {
  margin-top: 50px;
}

.apply-btn {
  font-size: 1rem; /* 大きさを変更 */
  padding: 8px 16px; /* サイズを変更 */
  width: 200px; /* 横幅を自動に設定 */
  transform: scale(1);
  transition: background-color 0.3s, border-color 0.3s, transform 0.3s;
}

.apply-btn:hover {
  transform: scale(1.05);
}

p {
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .apply-btn {
    font-size: 1rem;
    padding: 8px 16px;
    margin-top: 10px;
  }

  .info-item {
    flex: 1 1 100%;
  }

  .recruitment-content {
    padding: 15px;
  }
}
</style>
