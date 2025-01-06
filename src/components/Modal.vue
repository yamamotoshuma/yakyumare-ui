<template>
  <div v-if="visible" class="custom-overlay" @click.self="close">
    <div class="custom-card">
      <div class="custom-card-header">
        <h4>{{ title }}</h4>
      </div>
      <div class="custom-card-body">
        <p style="white-space: pre-wrap; word-wrap: break-word">
          {{ bodyText }}
        </p>
      </div>
      <div class="custom-card-footer">
        <button class="custom-btn custom-btn-cancel" @click="close">
          キャンセル
        </button>
        <button
          class="custom-btn custom-btn-confirm"
          @click="$emit('confirmAction')"
        >
          確定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref } from "vue";

const props = defineProps({
  title: String,
  bodyText: String,
});

const title = props.title;
const bodyText = props.bodyText;

const emit = defineEmits(["closeModal", "confirmAction"]);

const visible = ref(true);

const close = () => {
  visible.value = false;
  emit("closeModal");
};
</script>

<style scoped>
.custom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
}

.custom-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  animation: fadeIn 0.3s ease;
}

.custom-card-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #ff7e00;
  color: white;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.custom-card-body {
  padding: 20px;
}

.custom-card-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px;
}

.custom-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.custom-btn-cancel {
  background-color: #f1f1f1;
  color: #555;
}

.custom-btn-cancel:hover {
  background-color: #e0e0e0;
}

.custom-btn-confirm {
  background-color: #ff7e00; /* オレンジ */
  color: white;
}

.custom-btn-confirm:hover {
  background-color: #e66b00; /* ホバー時のオレンジの濃い色 */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
