<template>
  <div>
    <ul v-if="comments.length > 0" class="comment-list">
      <li v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-header">
          <img
            :src="getProfileUrl(comment.user)"
            alt="User Avatar"
            class="avatar"
          />
          <strong>{{ comment.user.name }}</strong>
        </div>
        <p class="comment-content">{{ comment.content }}</p>
        <small class="comment-date">{{ formatDate(comment.created_at) }}</small>
      </li>
    </ul>
    <div v-else class="no-comments">
      <p>コメントはまだありません。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getProfileUrl } from "@/service/profileImage";

const props = defineProps<{ comments: any }>();
const comments = props.comments;

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>

<style scoped>
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.comment-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  font-size: 1rem;
  color: #333;
  margin-bottom: 10px;
}

.comment-date {
  color: #6c757d;
  font-size: 0.875rem;
}

.no-comments {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
  font-size: 1.25rem;
  color: #6c757d;
}

p {
  white-space: pre-wrap;
}

/* Responsive Design */
@media (max-width: 768px) {
  .comment-item {
    padding: 15px;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }

  .comment-content {
    font-size: 0.875rem;
  }

  .comment-date {
    font-size: 0.75rem;
  }

  .no-comments {
    font-size: 1rem;
    padding: 15px;
  }
}
</style>
