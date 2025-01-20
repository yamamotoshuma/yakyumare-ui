<template>
  <div>
    <div class="container" style="min-height: 100vh">
      <div class="card-top">
        <router-link
          class="btn btn-danger mb-2 create-btn"
          :to="{ name: 'RecruitmentCreate' }"
        >
          <i class="bi bi-plus-circle-fill"></i> 募集を新規作成する
        </router-link>
      </div>
      <div class="filter-sort mb-4">
        <div class="search-conditions-header">
          <button class="btn-toggle" @click="toggleSortOptions">
            <i :class="showSortOptions ? 'bi-dash' : 'bi-plus'"></i>
          </button>
          <span class="search-conditions-text">検索条件</span>
        </div>
        <div v-if="showSortOptions" class="sort-options">
          <div class="grid-container">
            <label for="type_id" class="grid-label">募集の種類</label>
            <select
              id="type_id"
              v-model="filters.type_id"
              class="form-select grid-input"
            >
              <option value="">選択してください</option>
              <option
                v-if="recruitmentTypes.length > 0"
                v-for="type in recruitmentTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.name }}
              </option>
            </select>

            <label for="start_date" class="grid-label">開始日</label>
            <input
              id="start_date"
              type="date"
              v-model="filters.start_date"
              class="form-control grid-input"
            />

            <label for="end_date" class="grid-label">終了日</label>
            <input
              id="end_date"
              type="date"
              v-model="filters.end_date"
              class="form-control grid-input"
            />

            <label for="prefecture" class="grid-label">都道府県</label>
            <select
              id="prefecture"
              v-model="filters.prefecture"
              @change="onPrefectureChange"
              class="form-select grid-input"
            >
              <option value="">選択してください</option>
              <option
                v-for="prefecture in prefectures"
                :key="prefecture.name"
                :value="prefecture.name"
              >
                {{ prefecture.name }}
              </option>
            </select>

            <label for="city" class="grid-label">市区町村</label>
            <select
              id="city"
              v-model="filters.city"
              class="form-select grid-input"
            >
              <option value="">市区町村で絞り込む</option>
              <option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
          </div>
          <div class="text-center mt-2">
            <button class="btn btn-primary" @click="applyFilters">
              この条件で検索
            </button>
          </div>
        </div>
      </div>
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
        <label class="active-only">
          <input
            type="checkbox"
            v-model="filters.active_only"
            @change="applyFilters"
          />
          募集中のみ
        </label>
      </div>
      <!-- 募集リスト部分 -->
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
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "@/service/axios";
import { prefectures } from "@/const/prefectures";
import RecruitmentList from "@/components/RecruitmentList.vue";

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
interface RecruitmentType {
  id: number;
  name: string;
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
  order: "desc",
});

const showSortOptions = ref(false);
const recruitmentTypes = ref<RecruitmentType[]>([]);

const cities = computed(() => {
  const selectedPrefecture = prefectures.find(
    (prefecture) => prefecture.name === filters.value.prefecture
  );
  return selectedPrefecture ? selectedPrefecture.cities : [];
});

const toggleSortOptions = () => {
  showSortOptions.value = !showSortOptions.value;
};

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

const updateSort = (key: string) => {
  sort.value.key = key;
  applyFilters();
};

const onPrefectureChange = () => {
  filters.value.city = "";
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
  try {
    await applyFilters();
    const response = await axios.get("recruitmentType");
    recruitmentTypes.value = response.data;
  } catch (error) {
    console.error("エラーが発生しました", error);
  }
});
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: auto;
  padding: 20px;
  color: #333;
}

h2 {
  color: #ff8c00;
  font-family: "Arial", sans-serif;
}

.filter-sort {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
}

.search-conditions-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-conditions-text {
  font-weight: bold;
  color: #333;
}

.sort-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
}

.grid-label {
  align-self: center;
}

.grid-input {
  width: 100%;
}

.card-top {
  text-align: center;
}

.create-btn {
  max-width: 200px;
}

.card-columns {
  column-count: 2;
}

.card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: transform 0.2s;
}

.card-inactive {
  background-color: #dcdcdc;
}

.card:hover {
  transform: scale(1.05);
}

.card-body {
  padding: 20px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-text {
  margin-top: 10px;
  font-size: 1rem;
}

.text-muted {
  color: #6c757d !important;
}

.btn-toggle {
  background-color: #ff8c00;
  border: none;
  color: #fff;
  font-size: 24px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  cursor: pointer;
}

.btn-toggle:hover {
  background-color: #e07b00;
}

.btn-primary {
  background-color: #ff8c00;
  border-color: #ff8c00;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-primary:hover {
  background-color: #e07b00;
  border-color: #e07b00;
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

.active-only {
  margin-left: 20px;
}
</style>
