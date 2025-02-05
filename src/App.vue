<template>
  <div id="app">
    <Navbar v-if="isHeaderVisible" />
    <router-view @toggle-header="toggleHeaderVisibility" />
    <footer class="border-top border-warning">
      <p class="footer-text">© All rights reserved by Yakyumare</p>
    </footer>
  </div>
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
import { useRoute } from "vue-router";
import { watch, ref } from "vue";

const route = useRoute();
const isHeaderVisible = ref(true);
// スクロールを禁止するページのパス
const noScrollPages = ["/message"];

const toggleHeaderVisibility = (visible) => {
  isHeaderVisible.value = visible;
};

watch(route, (newRoute) => {
  if (noScrollPages.includes(newRoute.path)) {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  } else {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
  }

  // head titleをルートごとに変更する
  if (newRoute.meta.title) {
    let setTitle = newRoute.meta.title + " | やきゅま～れ";
    document.title = setTitle;
  } else {
    document.title = "やきゅまーれ";
  }

  // メタタグのdescription設定処理
  if (newRoute.meta.desc) {
    document
      .querySelector("meta[name='description']")
      .setAttribute("content", newRoute.meta.desc);
  } else {
    document
      .querySelector("meta[name='description']")
      .setAttribute(
        "content",
        "草野球専門の総合掲示板『やきゅま～れ』は、試合募集、メンバー募集、助っ人募集など、草野球に関する情報を簡単に共有できるプラットフォームです。野球好きの仲間と試合や練習の予定を調整するのに最適なコミュニティです。"
      );
  }

  // **ページ遷移時にスクロールをリセット**
  window.scrollTo(0, 0);
});
</script>

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
