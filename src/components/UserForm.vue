<template>
  <div class="user-form-container">
    <div class="card user-form-card">
      <h2 class="text-center mb-4">{{ title }}</h2>
      <slot name="description"></slot>
      <form @submit.prevent="handleSubmit">
        <slot name="additional-top-fields"></slot>
        <div v-for="field in fields" :key="field.name" class="mb-3">
          <label :for="field.name" class="form-label">
            {{ field.label }}
            <span
              :style="{
                backgroundColor: field.required ? 'red' : 'gray',
                color: 'white',
                padding: '0px 5px',
                borderRadius: '3px',
              }"
            >
              {{ field.required ? "必須" : "任意" }}
            </span>
          </label>
          <textarea
            v-if="field.type == 'textarea'"
            rows="5"
            v-model="formData[field.name]"
            :id="field.name"
            :placeholder="field.placeholder"
            class="form-control"
            :disabled="field.disabled"
            :required="field.required"
          >
          </textarea>
          <input
            v-else
            v-model="formData[field.name]"
            :type="field.type"
            :id="field.name"
            :placeholder="field.placeholder"
            class="form-control"
            :disabled="field.disabled"
            :required="field.required"
          />
        </div>
        <slot name="additional-under-fields"></slot>
        <button type="submit" class="btn btn-primary w-100 mb-2 mt-4">
          {{ props.submitButtonText }}
        </button>
        <div
          v-for="button in additionalButtons"
          :key="button.text"
          class="mt-2"
        >
          <router-link :to="button.to" :class="['btn w-100', button.class]">
            {{ button.text }}
          </router-link>
        </div>
        <slot name="additional-button-fields"></slot>
        <GoogleLogin
          v-if="isGoogleLogin"
          :callback="handleCallback"
          class="google-login-button w-100"
        >
          <template v-slot:default="{ togglePopup }">
            <button
              @click="togglePopup"
              type="button"
              class="btn btn-light w-100 mt-2"
            >
              <i class="bi bi-google"></i> Sign in with Google
            </button>
          </template>
        </GoogleLogin>
      </form>
      <div v-if="errorMessages?.length" class="mt-3">
        <ul class="list-group">
          <li
            v-for="(msg, index) in errorMessages"
            class="list-group-item list-group-item-danger"
            :key="index"
          >
            {{ msg }}
          </li>
        </ul>
      </div>
      <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { GoogleLogin } from "vue3-google-login";

interface Field {
  name: string;
  type: string;
  label: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
}
interface Button {
  text: string;
  to: any;
  class: string;
}
interface FormData {
  [key: string]: any;
}

const props = defineProps({
  title: { type: String, required: true },
  submitButtonText: { type: String, required: true },
  fields: { type: Array as () => Field[], required: true },
  additionalButtons: { type: Array as () => Button[], required: false },
  errorMessages: { type: Array as () => string[], default: () => [] },
  successMessage: { type: String, required: false },
  isGoogleLogin: { type: Boolean, required: false },
  initialData: { type: Object, default: () => ({}) },
});

const formData = reactive<FormData>({ ...props.initialData });
const emit = defineEmits(["submit", "googleLogin"]);

const handleSubmit = async () => {
  emit("submit", formData);
};

const handleCallback = async (response: any) => {
  emit("googleLogin", response);
};
</script>

<style scoped>
.user-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%);
  padding: 20px;
}

.user-form-card {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.user-form-card:hover {
  transform: scale(1.02);
}

h2 {
  font-size: 1.5rem;
  font-family: "Arial", sans-serif;
  font-weight: bold;
}

.form-label {
  font-weight: bold;
  color: #333;
}

.form-control {
  margin-bottom: 20px;
  border-radius: 5px;
  padding: 10px;
  border: 2px solid #ddd;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #ff8c00;
}

.btn-primary {
  background-color: #ff8c00;
  border-color: #ff8c00;
  font-size: 1.2rem;
  padding: 10px 20px;
  transition: background-color 0.3s, border-color 0.3s, transform 0.3s;
}

.btn-primary:hover {
  background-color: #e07b00;
  border-color: #e07b00;
  transform: scale(1.05);
}

.alert {
  margin-top: 20px;
  border-radius: 5px;
  font-weight: bold;
}

.google-login-button {
  margin-top: 10px;
}

.google-login-button button {
  background-color: #fff;
  color: #757575;
  border: 1px solid #ddd;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.google-login-button button:hover {
  background-color: #f5f5f5;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.google-login-button i {
  margin-right: 10px;
}

@media (max-width: 768px) {
  .user-form-card {
    padding: 20px;
  }

  .btn-primary {
    font-size: 1rem;
    padding: 8px 16px;
  }
}

@media (min-width: 769px) {
  .user-form-card {
    width: 100%;
    min-width: 650px;
    padding: 30px;
    background: #ffffff;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
  }
}
</style>
