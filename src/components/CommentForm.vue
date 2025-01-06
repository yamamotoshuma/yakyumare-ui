<template>
  <div v-if="props.user_id" class="mb-3 mt-3">
    <h4>コメントを追加</h4>
    <form @submit.prevent="submitComment">
      <textarea
        v-model="content"
        class="form-control mb-2"
        rows="10"
        required
      ></textarea>
      <button type="submit" class="btn btn-primary mx-auto d-block">
        コメントを投稿する
      </button>
    </form>
  </div>
  <div class="text-center mt-3" v-else>
    コメントを投稿するにはログインしてください
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Propsの型指定
const props = defineProps<{ user_id: string | null }>();
const emit = defineEmits(["submit"]);
const content = ref("");

// コメント送信関数
const submitComment = async () => {
  emit("submit", content);
  // フォームをリセット
  content.value = "";
};
</script>

<style scoped>
.btn-primary {
  background-color: #ff8c00;
  border-color: #ff8c00;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-primary:hover {
  background-color: #e07b00;
  border-color: #e07b00;
}
</style>
