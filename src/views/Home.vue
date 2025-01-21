<script setup lang="ts">
import NoticesList from "@/components/NoticeList.vue";
import axios from "@/service/axios";
import { ref, onMounted } from "vue";
import RecruitmentList from "@/components/RecruitmentList.vue";
import { RouterLink } from "vue-router";

interface Recruitment {
  id: string;
  active: boolean;
  deadline: string;
  created_at: string;
  title: string;
  user: {
    name: string;
  };
  event_date: string;
  prefecture: string;
  city: string;
  place: string;
}
interface FilterOptions {
  type_id: string;
  start_date: string;
  end_date: string;
  prefecture: string;
  city: string;
  active_only: boolean;
}
interface SortOptions {
  key: string;
  order: string;
}
interface PaginatedRecruitments {
  data: Recruitment[];
  current_page: number;
  last_page: number;
  prev_page_url: string | undefined;
  next_page_url: string | undefined;
}

const recruitments = ref<PaginatedRecruitments>({
  data: [],
  current_page: 1,
  last_page: 1,
  prev_page_url: undefined,
  next_page_url: undefined,
});
const filters = ref<FilterOptions>({
  type_id: "",
  start_date: "",
  end_date: "",
  prefecture: "",
  city: "",
  active_only: false,
});
const sort = ref<SortOptions>({
  key: "created_at",
  order: "asc",
});

const applyFilters = async () => {
  try {
    const params = {
      ...filters.value,
      sort: sort.value.key,
      order: sort.value.order,
    };
    const response = await axios.get("recruitment", {
      params,
    });
    recruitments.value = response.data;
  } catch (error) {
    console.error("Error applying filters:", error);
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

onMounted(async () => {
  await applyFilters();
});
</script>

<template>
  <div class="main-visual">
    <img
      src="/main-visual.webp"
      alt="Main Visual"
      class="main-visual-image"
      width="100%"
      height="auto"
    />
  </div>
  <div class="container mt-5" style="min-height: 100vh">
    <NoticesList class="mb-4"></NoticesList>
    <div class="card mb-4">
      <div class="card-body">
        <h1 clas="text-center">
          <i class="bi bi-calendar-check"></i> 新着の募集
        </h1>
        <RecruitmentList
          :recruitments="recruitments.data"
          :currentPage="recruitments.current_page"
          :lastPage="recruitments.last_page"
          :prevPageUrl="recruitments.prev_page_url"
          :nextPageUrl="recruitments.next_page_url"
          @page-change="changePage"
        />
      </div>
      <RouterLink class="text-center mt-2" to="/recruitment/list"
        >もっと見る</RouterLink
      >
    </div>
  </div>
</template>

<style scoped>
.main-visual {
  width: 100%;
  height: auto;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

@media (max-width: 992px) {
  .main-visual {
    height: auto !important;
  }
}

.main-visual-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  outline: none; /* フォーカス時の点線を消す */
  border: none; /* 余計な枠線を消す */
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background-color: #fdfdfd;
  padding: 20px;
  border-radius: 10px;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #ff8c00;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
</style>
