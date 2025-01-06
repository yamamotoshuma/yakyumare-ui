<template>
  <div>
    <div v-if="recruitments && recruitments.length">
      <div
        v-for="recruitment in recruitments"
        :key="recruitment.id"
        :class="[
          'card',
          'card-columns',
          {
            'card-inactive':
              !recruitment.active ||
              new Date(recruitment.deadline) < new Date(),
          },
        ]"
      >
        <router-link
          :to="`/recruitment/${recruitment.id}`"
          class="card-body text-decoration-none"
        >
          <div class="card-title text-decoration-none">
            <span v-if="isNew(recruitment.created_at)" class="new-label"
              ><i class="bi bi-star-fill"></i> NEW</span
            >
            <span
              v-if="
                !recruitment.active ||
                new Date(recruitment.deadline) < new Date()
              "
              class="inactive-label"
            >
              <i class="bi bi-x-circle-fill"></i> 募集終了
            </span>
            {{ recruitment.title }}
          </div>
          <small class="text-muted">
            <div class="d-flex align-items-center">
              <img
                :src="getProfileUrl(recruitment.user)"
                alt="User Avatar"
                class="rounded-circle"
                style="width: 20px; height: 20px; object-fit: cover"
              />
              &nbsp;{{ recruitment.user.name }}
            </div>
            開催日: {{ formatDate(recruitment.event_date) }}<br />
            エリア: {{ recruitment.prefecture }} - {{ recruitment.city }}<br />
            会場名: {{ recruitment.place }}
          </small>
        </router-link>
      </div>
    </div>
    <div v-else>
      <p class="text-center">募集が見つかりませんでした。</p>
    </div>
    <div class="pagination" v-if="recruitments && recruitments.length">
      <button :disabled="!prevPageUrl" @click="changePage(prevPageUrl)">
        前へ
      </button>
      <span class="pagination-info">{{ currentPage }} / {{ lastPage }}</span>
      <button :disabled="!nextPageUrl" @click="changePage(nextPageUrl || '')">
        次へ
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { getProfileUrl } from "@/service/profileImage";

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

defineProps({
  recruitments: {
    type: Array as PropType<Recruitment[]>,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  lastPage: {
    type: Number,
    required: true,
  },
  prevPageUrl: String,
  nextPageUrl: String,
});
const emit = defineEmits(["page-change"]);

const isNew = (createdAt: string) => {
  const now = new Date();
  const createdDate = new Date(createdAt);
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const changePage = (url: string | undefined) => {
  if (url) {
    emit("page-change", url);
  }
};
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

.crete-btn {
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
  font-weight: bold;
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

.text-center {
  text-align: center;
}

.sort-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-weight: bold;
}

.sort-bar a {
  color: #333;
  text-decoration: none;
}

.sort-bar a.active {
  color: #ff8c00;
}

.active-only {
  margin-left: auto;
}

.new-label {
  background-color: #ff0000;
  color: #fff;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 0.75rem;
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.inactive-label {
  background-color: #6c757d;
  color: #fff;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 0.75rem;
  margin-right: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
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

/* Responsive Design */
@media (max-width: 768px) {
  .card-columns {
    column-count: 1;
  }

  .grid-container {
    grid-template-columns: 1fr;
  }

  .grid-label {
    justify-self: start;
  }
}
</style>
