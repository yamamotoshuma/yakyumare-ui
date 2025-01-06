<template>
  <Navbar />
  <div class="container mb-5">
    <h1>メール確認が完了しました</h1>
    <p>あなたのメールアドレスは正常に確認されました。</p>
    <router-link to="/" class="btn btn-primary">ホーム画面へ</router-link>
  </div>
  <div style="height: 450px"></div>
</template>

<script setup>
import Navbar from "@/components/Navbar.vue";
</script>

<style scoped>
.container {
  margin-top: 50px;
  text-align: center;
}
</style>
