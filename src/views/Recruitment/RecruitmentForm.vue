<template>
  <div>
    <Navbar />
    <div class="container">
      <h2 class="text-center mb-4">
        <i class="bi bi-pencil-square me-2" aria-hidden="true"></i>
        {{ isEdit ? "募集編集" : "募集作成" }}
      </h2>
      <form @submit.prevent="submitForm" class="recruitment-form">
        <div class="mb-3">
          <label for="type" class="form-label"
            >種類 <span class="required-label">必須</span></label
          >
          <select v-model="recruitment.type_id" class="form-select">
            <option
              v-for="type in recruitmentTypes"
              :value="type.id"
              :key="type.id"
            >
              {{ type.name }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label for="title" class="form-label"
            >タイトル <span class="required-label">必須</span></label
          >
          <input
            type="text"
            v-model="recruitment.title"
            class="form-control"
            required
          />
        </div>
        <div class="mb-3">
          <label for="content" class="form-label"
            >内容 <span class="required-label">必須</span></label
          >
          <textarea
            v-model="recruitment.content"
            class="form-control"
            rows="10"
            required
          ></textarea>
        </div>
        <div class="mb-3">
          <label for="event_date" class="form-label"
            >開催日 <span class="required-label">必須</span></label
          >
          <input
            type="datetime-local"
            v-model="recruitment.event_date"
            class="form-control"
            required
          />
        </div>
        <div class="mb-3">
          <label for="deadline" class="form-label"
            >募集期限 <span class="required-label">必須</span></label
          >
          <input
            type="datetime-local"
            v-model="recruitment.deadline"
            class="form-control"
            required
          />
        </div>
        <div class="mb-3">
          <label for="prefecture" class="form-label"
            >都道府県 <span class="required-label">必須</span></label
          >
          <select
            id="prefecture"
            v-model="recruitment.prefecture"
            @change="onPrefectureChange"
            class="form-select form-control"
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
        </div>
        <div class="mb-3">
          <label for="city" class="form-label"
            >市区町村 <span class="required-label">必須</span></label
          >
          <select
            id="city"
            v-model="recruitment.city"
            class="form-select form-control"
          >
            <option v-for="city in cities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label for="place" class="form-label"
            >会場名 <span class="required-label">必須</span></label
          >
          <input
            type="text"
            v-model="recruitment.place"
            class="form-control"
            required
          />
        </div>
        <div class="mb-3">
          <label for="capacity" class="form-label"
            >定員 <span class="required-label">必須</span></label
          >
          <input
            type="number"
            v-model="recruitment.capacity"
            class="form-control"
            required
          />
        </div>
        <div class="d-flex justify-content-center">
          <button type="submit" class="btn btn-primary">
            {{ isEdit ? "更新" : "作成" }}
          </button>
          <button
            v-if="isEdit"
            @click="closeRecruitment"
            type="button"
            class="ml-4 btn btn-danger text-white"
          >
            募集終了
          </button>
        </div>
        <div v-if="error" class="alert alert-danger mt-3" v-html="error"></div>
      </form>
    </div>
    <Modal
      v-if="showModal"
      :title="modalTitle"
      :bodyText="modalBodyText"
      @closeModal="closeModal"
      @confirmAction="confirmAction"
    />
    <LoadingScreen v-show="load"></LoadingScreen>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "@/service/axios";
import Navbar from "@/components/Navbar.vue";
import { prefectures } from "@/const/prefectures";
import user from "@/store";
import LoadingScreen from "@/components/LoadingScreen.vue";
import Modal from "@/components/Modal.vue";
import { createApiError } from "@/service/errorService";

const route = useRoute();
const router = useRouter();
const error = ref<string[] | null>(null);
const load = ref(false);
const modalTitle = ref("");
const modalBodyText = ref("");
const modalAction = ref<"register" | "update" | "close" | null>(null);

const showModal = ref(false);
const recruitment = ref({
  user_id: "",
  type_id: "",
  title: "",
  content: "",
  event_date: "",
  deadline: "",
  prefecture: "",
  city: "",
  place: "",
  capacity: "",
});

interface RecruitmentType {
  id: number;
  name: string;
}

const recruitmentTypes = ref<RecruitmentType[]>([]);
const isEdit = computed(() => route.params.id !== undefined);

const cities = computed(() => {
  const selectedPrefecture = prefectures.find(
    (prefecture) => prefecture.name === recruitment.value.prefecture
  );
  return selectedPrefecture ? selectedPrefecture.cities : [];
});

const onPrefectureChange = () => {
  recruitment.value.city = "";
};

const submitForm = async () => {
  if (isEdit.value) {
    modalTitle.value = "編集";
    modalBodyText.value = "募集を更新します。\nよろしいですか？";
    modalAction.value = "update";
  } else {
    modalTitle.value = "登録";
    modalBodyText.value = "募集を登録します。\nよろしいですか？";
    modalAction.value = "register";
  }
  showModal.value = true;
};

const closeRecruitment = async () => {
  modalTitle.value = "終了";
  modalBodyText.value = "募集を終了します。\nよろしいですか？";
  modalAction.value = "close";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const confirmAction = async () => {
  closeModal();
  load.value = true;
  try {
    if (modalAction.value == "update") {
      if (isEdit.value) {
        await axios.put(`recruitment/${route.params.id}`, recruitment.value);
      }
    } else if (modalAction.value == "register") {
      await axios.post("recruitment", recruitment.value);
    } else if (modalAction.value == "close") {
      if (isEdit.value) {
        const data = {
          id: route.params.id,
        };
        await axios.put("close-recruitment", data);
        router.push("/recruitment/list");
      }
    }
    router.push("/recruitment/list");
  } catch (e) {
    error.value = createApiError(e);
  } finally {
    load.value = false;
  }
};

onMounted(async () => {
  error.value = null;
  load.value = false;
  const response = await axios.get("recruitmentType");
  recruitmentTypes.value = response.data;

  if (isEdit.value) {
    const res = await axios.get(`recruitment/${route.params.id}`);
    recruitment.value = res.data;
  }

  const userRes = await user.dispatch("checkAuthStatus");
  recruitment.value.user_id = userRes.data.id;
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  color: #333;
  font-family: "Helvetica Neue", sans-serif;
}

h2 {
  font-size: 1.8rem; /* 大きさを変更 */
  font-weight: bold;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 40px;
}

.form-label {
  font-weight: bold;
  color: #333;
}

.form-control,
.form-select {
  margin-bottom: 20px;
  border-radius: 5px;
  padding: 10px;
  border: 2px solid #ddd;
  transition: border-color 0.3s;
}

.form-control:focus,
.form-select:focus {
  border-color: #ff8c00;
}

.btn {
  font-size: 1rem; /* 大きさを変更 */
  padding: 8px 16px; /* サイズを変更 */
  width: 200px; /* 横幅を自動に設定 */
  transform: scale(1);
  transition: background-color 0.3s, border-color 0.3s, transform 0.3s;
}

.btn-primary {
  background-color: #ff8c00;
  border-color: #ff8c00;
}

.btn-primary:hover {
  background-color: #e07b00;
  border-color: #e07b00;
  transform: scale(1.05);
}

.btn-danger:hover {
  transform: scale(1.05);
}

.recruitment-form {
  background: linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%);
  padding: 50px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.required-label {
  background-color: red;
  color: white;
  padding: 0px 5px;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  h2 {
    font-size: 1.4rem;
  }

  .form-control,
  .form-select {
    padding: 8px;
  }
}
</style>
