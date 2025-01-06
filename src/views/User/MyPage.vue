<template>
  <Navbar />
  <div
    class="container d-flex flex-column flex-md-row justify-content-center align-items-md-start mt-8 mb-2"
    style="min-height: 100vh"
    v-if="user"
  >
    <!-- プロフィールカード -->
    <div class="card p-4 shadow-lg profile-card">
      <h2 class="text-start text-md-start mb-4">
        <i class="bi bi-person-circle"></i>
        {{ isOtherUser ? "ユーザー" : "マイページ" }}
      </h2>
      <div class="mb-4 text-center">
        <img
          :src="getProfileUrl(user)"
          alt="User Avatar"
          class="rounded-circle mb-3"
          style="width: 150px; height: 150px; object-fit: cover"
        />
        <h4>{{ user.name }}</h4>
        <router-link
          v-if="!isOtherUser"
          :to="{ name: 'EditProfile' }"
          class="btn btn-secondary"
        >
          プロフィール編集
        </router-link>
      </div>
      <div class="mb-3">
        <div id="bio" class="bio" v-if="user.bio">{{ user.bio }}</div>
        <div id="bio" class="" v-else>ひとことが見つかりませんでした。</div>
      </div>
      <div class="mb-3">
        <p class="text-body-secondary">
          登録日 {{ user.created_at ? formatDate(user.created_at) : "" }}
        </p>
      </div>
    </div>

    <!-- 応募一覧 -->
    <div class="other-contents">
      <div class="card p-4 shadow-lg recruitment-list">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="mb-4 text-start text-md-start">
            <i class="bi bi-list-task"></i> 応募一覧
          </h2>
          <button class="btn btn-link" @click="toggleList('apply')">
            <i
              :class="applyVisible ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"
            ></i>
          </button>
        </div>
        <div v-if="applyVisible">
          <div class="sort-bar">
            <span>並び順：</span>
            <a
              href="#"
              :class="{ active: applySort.key === 'created_at' }"
              @click.prevent="updateApplySort('created_at')"
            >
              <i class="bi bi-calendar-plus"></i> 新着順
            </a>
            <span> | </span>
            <a
              href="#"
              :class="{ active: applySort.key === 'event_date' }"
              @click.prevent="updateApplySort('event_date')"
            >
              <i class="bi bi-calendar-event"></i> 日付順
            </a>
          </div>
          <RecruitmentList
            :recruitments="applyRecruitments.data"
            :currentPage="applyRecruitments.current_page"
            :lastPage="applyRecruitments.last_page"
            :prevPageUrl="applyRecruitments.prev_page_url"
            :nextPageUrl="applyRecruitments.next_page_url"
            @page-change="applyChangePage"
          />
        </div>
      </div>
      <div class="card p-4 shadow-lg recruitment-list">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="mb-4 text-start text-md-start">
            <i class="bi bi-list-task"></i> 募集一覧
          </h2>
          <button class="btn btn-link" @click="toggleList('recruitment')">
            <i
              :class="
                recruitmentVisible ? 'bi bi-chevron-up' : 'bi bi-chevron-down'
              "
            ></i>
          </button>
        </div>
        <div v-if="recruitmentVisible">
          <div class="sort-bar">
            <span>並び順：</span>
            <a
              href="#"
              :class="{ active: sort.key === 'created_at' }"
              @click.prevent="updateSort('created_at')"
            >
              <i class="bi bi-calendar-plus"></i> 新着順
            </a>
            <span> | </span>
            <a
              href="#"
              :class="{ active: sort.key === 'event_date' }"
              @click.prevent="updateSort('event_date')"
            >
              <i class="bi bi-calendar-event"></i> 日付順
            </a>
          </div>
          <RecruitmentList
            :recruitments="recruitments.data"
            :currentPage="recruitments.current_page"
            :lastPage="recruitments.last_page"
            :prevPageUrl="recruitments.prev_page_url"
            :nextPageUrl="recruitments.next_page_url"
            @page-change="changePage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import store from "@/store";
import Navbar from "@/components/Navbar.vue";
import RecruitmentList from "@/components/RecruitmentList.vue";
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import axios from "@/service/axios";
import { getProfileUrl } from "@/service/profileImage";

const applyRecruitments = ref({
  data: [],
  current_page: 1,
  last_page: 1,
  prev_page_url: undefined,
  next_page_url: undefined,
});

const recruitments = ref({
  data: [],
  current_page: 1,
  last_page: 1,
  prev_page_url: undefined,
  next_page_url: undefined,
});

const applyFilters = ref({
  type_id: "",
  start_date: "",
  end_date: "",
  prefecture: "",
  city: "",
  active_only: false,
  apply_user_id: "",
  per_page: 10,
});

const filters = ref({
  type_id: "",
  start_date: "",
  end_date: "",
  prefecture: "",
  city: "",
  active_only: false,
  user_id: "",
  per_page: 10,
});

const applySort = ref({
  key: "created_at",
  order: "asc",
});

const sort = ref({
  key: "created_at",
  order: "asc",
});

const user = ref<any>(null);
const recruitmentVisible = ref(false);
const applyVisible = ref(false);
const route = useRoute();
const isOtherUser = ref(true);

const getRecruitments = async (filters: any, sort: any) => {
  try {
    const params = {
      ...filters,
      sort: sort.key,
      order: sort.order,
    };
    const response = await axios.get("recruitment", { params });
    return response;
  } catch (error) {
    console.error("Error applying filters:", error);
  }
};

const applyChangePage = async (url: string) => {
  try {
    const params = new URLSearchParams(applyFilters.value as any).toString();
    const params2 = new URLSearchParams(applySort.value as any).toString();
    const response = await axios.get(`${url}&${params}&${params2}`);
    applyRecruitments.value = response.data;
  } catch (error) {
    console.error("Error changing page:", error);
  }
};

const changePage = async (url: string) => {
  try {
    const params = new URLSearchParams(filters.value as any).toString();
    const params2 = new URLSearchParams(sort.value as any).toString();
    const response = await axios.get(`${url}&${params}&${params2}`);
    recruitments.value = response.data;
  } catch (error) {
    console.error("Error changing page:", error);
  }
};

const updateApplySort = (key: string) => {
  applySort.value.key = key;
  getRecruitments(applyFilters.value, applySort.value);
};

const updateSort = (key: string) => {
  sort.value.key = key;
  getRecruitments(filters.value, sort.value);
};

const toggleList = (val: "apply" | "recruitment") => {
  if (val === "apply") {
    applyVisible.value = !applyVisible.value;
  } else if (val === "recruitment") {
    recruitmentVisible.value = !recruitmentVisible.value;
  }
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}年${month}月${day}日`;
}

onMounted(async () => {
  if (route.params.id) {
    const response = await axios.get(`get-user/${route.params.id}`);
    user.value = response.data;
  } else {
    const response = await store.dispatch("checkAuthStatus");
    user.value = response.data;
    isOtherUser.value = false;
  }

  filters.value.user_id = user.value?.id;
  applyFilters.value.apply_user_id = user.value?.id;

  const res = await getRecruitments(filters.value, sort.value);
  const applyRes = await getRecruitments(applyFilters.value, applySort.value);
  recruitments.value = res?.data;
  applyRecruitments.value = applyRes?.data;
});
</script>

<style scoped>
.card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.5rem;
  font-family: "Arial", sans-serif;
  font-weight: bold;
  color: #333333;
}

.form-label {
  font-weight: bold;
  color: #555555;
}

.form-control {
  background-color: #f9f9f9;
  border: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  padding: 10px;
}

.rounded-circle {
  border: 2px solid #ddd;
}

.sort-bar {
  margin-top: 20px;
  margin-bottom: 20px;
}

.sort-bar span {
  margin: 0 10px;
}

.sort-bar a {
  color: #007bff;
  text-decoration: none;
}

.sort-bar a.active {
  font-weight: bold;
  color: #0056b3;
}

.recruitment-list {
  margin-bottom: 20px;
}

.bio {
  white-space: pre-wrap;
  word-wrap: break-word;
}
/* レスポンシブスタイル */
/* TODO:Bootstrapで960pxで崩れる対策 */
@media (max-width: 960px) {
  .container {
    flex-direction: column;
    align-items: center;
  }

  .profile-card,
  .other-contents {
    width: 100%;
    margin-bottom: 20px;
  }
}

@media (min-width: 961px) {
  .profile-card {
    flex-basis: 30%; /* 1:2の比率に調整 */
    margin-right: 40px;
  }

  .other-contents {
    flex-basis: 70%; /* 1:2の比率に調整 */
    width: 100%;
  }
}
</style>
