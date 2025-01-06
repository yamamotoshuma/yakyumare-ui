<template>
  <div class="container mt-5">
    <h1 class="mb-4 text-center"><i class="bi bi-megaphone"></i> お知らせ</h1>
    <router-link
      v-if="isAdmin"
      :to="{ name: 'NoticeCreate' }"
      class="btn btn-danger btn-sm mb-4"
    >
      新規作成
    </router-link>
    <div class="list-group">
      <router-link
        v-for="notice in notices.data"
        :key="notice.id"
        :to="{ name: 'NoticeDetail', params: { id: notice.id } }"
        class="list-group-item list-group-item-action flex-column align-items-start"
      >
        <div class="d-flex w-100 justify-content-between">
          <h5 class="mb-1">{{ notice.title }}</h5>
          <small>{{ new Date(notice.created_at).toLocaleDateString() }}</small>
        </div>
        <div v-html="getTrimmedContent(notice)"></div>
        <div class="mt-2">
          <router-link
            v-if="isAdmin"
            :to="{ name: 'NoticeEdit', params: { id: notice.id } }"
            class="btn btn-primary btn-sm"
          >
            修正
          </router-link>
          <button
            v-if="isAdmin"
            @click.stop.prevent="deleteNotice(notice.id)"
            class="btn btn-danger btn-sm"
          >
            削除
          </button>
        </div>
      </router-link>
    </div>
    <div class="pagination" v-if="notices.current_page">
      <button
        :disabled="!notices.prev_page_url"
        @click="fetchNotices(notices.prev_page_url)"
      >
        前へ
      </button>
      <span class="pagination-info"
        >{{ notices.current_page }} / {{ notices.last_page }}</span
      >
      <button
        :disabled="!notices.next_page_url"
        @click="fetchNotices(notices.next_page_url)"
      >
        次へ
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "@/service/axios";
import { useStore } from "vuex";
import sanitize from "@/service/marked";
import { createApiError } from "@/service/errorService";

const store = useStore();

const props = defineProps({
  role: {
    type: Number,
  },
});

const notices = ref({
  data: [],
  current_page: 0,
  last_page: 0,
  prev_page_url: null,
  next_page_url: null,
});

const isAdmin = ref(false);

const fetchUserRole = async () => {
  try {
    if (store.getters.isLoggedIn) {
      const response = await axios.get("/user");
      isAdmin.value = response.data.role_id === 1; // 管理者のrole_idを1とする
    }
  } catch (error) {
    console.log(createApiError(error));
  }
};

const fetchNotices = async (url = "/notices") => {
  try {
    const response = await axios.get(url);
    notices.value = response.data;
  } catch (error) {
    alert(createApiError(error));
  }
};

const deleteNotice = async (id) => {
  try {
    await axios.delete(`/notices/${id}`);
    fetchNotices(); // 更新
  } catch (error) {
    alert(createApiError(error));
  }
};

const MAX_CONTENT_LENGTH = 25;

// プレーンテキストに変換する関数
function markdownToPlainText(markdown) {
  // Markdownの記号を削除
  return markdown
    .replace(/[#>*_~`[\]]+/g, "") // 特殊文字を削除
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // リンクのMarkdownをプレーンテキストに変換
    .replace(/!\[(.*?)\]\(.*?\)/g, "$1"); // 画像のMarkdownをプレーンテキストに変換
}

function getTrimmedContent(notice) {
  const plainTextContent = markdownToPlainText(notice.content);
  if (plainTextContent.length > MAX_CONTENT_LENGTH) {
    return plainTextContent.substring(0, MAX_CONTENT_LENGTH) + "...";
  }
  return plainTextContent;
}

function isContentTrimmed(notice) {
  return notice.content.length > MAX_CONTENT_LENGTH;
}

function viewMore(notice) {
  // 完全な内容を表示するために、詳細ページに遷移
  router.push({ name: "NoticeDetail", params: { id: notice.id } });
}

onMounted(() => {
  fetchNotices();
  fetchUserRole();
});
</script>

<style scoped>
.container {
  background-color: #fdfdfd;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #ff8c00;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.list-group-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: transform 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.list-group-item:hover {
  transform: scale(1.02);
  border-color: #ff8c00;
}

h5 {
  color: #ff8c00;
  font-weight: bold;
}

.mb-1 {
  margin-bottom: 0.5rem;
  color: #333;
}

small {
  color: #666;
}

.pagination .page-link {
  color: #ff8c00;
}

.pagination .page-item.disabled .page-link {
  color: #ddd;
}

.pagination .page-link:hover {
  color: #fff;
  background-color: #ff8c00;
  border-color: #ff8c00;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  background-color: #ff8c00;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
