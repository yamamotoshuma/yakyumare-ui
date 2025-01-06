<template>
  <div id="loading" class="loading">
    <div class="circle"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style>
.loading {
  position: fixed;
  z-index: 9999;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: black;
  opacity: 0.6;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.circle {
  width: 100px;
  height: 100px;
  border-radius: 150px;
  border: 15px solid #fff;
  border-top-color: rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  animation: circle 1s linear infinite;
  -webkit-animation: circle 1s linear infinite;
}
@keyframes circle {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes circle {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}
</style>
