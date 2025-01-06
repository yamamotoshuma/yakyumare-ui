<template>
  <div id="app">
    <router-view />
  </div>
  <footer class="border-top border-warning">
    <p class="footer-text">© All rights reserved by Yakyuma-re</p>
  </footer>
</template>

<script setup></script>

<style>
body {
  padding-top: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}

footer {
  width: 100%;
  height: 120px;
  text-align: center;
  padding: 50px 0;
  background-color: #fff;
}

.btn-primary {
  color: white !important;
}

.footer-text {
  color: #ff8c00 !important;
}

blockquote {
  padding: 10px 20px;
  margin: 0 0 20px;
  font-size: 18px;
  border-left: 5px solid #ff8c00;
  background-color: #f1f1f1;
}
</style>
