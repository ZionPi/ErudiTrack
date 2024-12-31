<template>
  <div class="all-notes-view">
    <div class="top-bar">
      <button class="back-button" @click="goBack">
        <span class="icon">
          <i class="fas fa-arrow-left"></i>
        </span>
        <span>返回</span>
      </button>
      <h1>我的笔记</h1>
    </div>
    <div v-if="savedNotes.length === 0" class="empty-notes">
      <p>你还没有保存任何笔记。</p>
    </div>
    <ul v-else class="notes-list">
      <li v-for="(note, index) in savedNotes" :key="index" class="note-item">
        <p class="note-text">{{ note.text }}</p>
        <div class="note-info">
          <span>题目ID: {{ note.questionId }}</span>
          <span> - {{ formatDate(note.timestamp) }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AllNotesView',
  data() {
    return {
      savedNotes: []
    };
  },
  mounted() {
    this.loadSavedNotes();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    loadSavedNotes() {
      const storedNotes = localStorage.getItem('savedNotes');
      if (storedNotes) {
        this.savedNotes = JSON.parse(storedNotes);
      }
    },
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      return new Intl.DateTimeFormat('zh-CN', options).format(new Date(date));
    }
  }
};
</script>

<style scoped>
.all-notes-view {
  padding: 20px;
}

.top-bar {
  position: relative; /* 为返回按钮的绝对定位提供参考 */
  margin-bottom: 30px; /* 增加底部外边距，与列表隔开 */
}

.back-button {
  position: absolute;
  top: 0;
  left: 0;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  font-size: 1rem; /* 调整字体大小 */
  color: #333; /* 设置文字颜色 */
  display: flex;
  align-items: center;
}

.back-button .icon {
  margin-right: 5px;
}

.top-bar h1 {
  text-align: center; /* 标题居中 */
  margin: 0; /* 移除默认的 margin */
  font-size: 1.5rem; /* 调整标题字体大小 */
}

.empty-notes {
  text-align: center;
  color: #777;
  padding: 20px;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.notes-list {
  list-style: none;
  padding: 0;
}

.note-item {
  background-color: #fff; /* 设置背景颜色 */
  border-radius: 8px; /* 圆角 */
  padding: 15px;
  margin-bottom: 15px; /* 底部外边距，实现间隔 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /*  হালকা ছায়া */
  width: 100%; /* 占满整行 */
  box-sizing: border-box; /* 包含 padding 和 border */
}

.note-text {
  font-size: 1.1rem;
  margin-bottom: 10px;
  line-height: 1.4; /* 增加行高，提高可读性 */
}

.note-info {
  font-size: 0.9rem;
  color: #888;
  display: flex;
  justify-content: space-between; /* 将题目ID和时间分散到两端 */
  align-items: center;
}

.note-info span:first-child {
  /* 可以针对第一个 span 进行样式设置 */
}

.note-info span:last-child {
  /* 可以针对最后一个 span 进行样式设置 */
}
</style>