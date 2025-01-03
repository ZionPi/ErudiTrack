<template>
  <div class="question-detail-tab-content history-tab-content">
    <div v-if="filteredSavedNotes.length === 0">
      还没有保存过针对这道题的解答。
    </div>
    <ul v-else>
      <li v-for="(note, index) in filteredSavedNotes" :key="index" class="saved-note-item">
        <p class="saved-note-text">{{ note.note_text }}</p>
        <p class="saved-note-date">{{ formatDate(note.created_at) }}</p>
        <el-button type="danger" size="mini" icon="el-icon-delete" @click.stop="deleteNote(note.note_id)"></el-button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HistoryTabContent',
  props: {
    questionId: {
      type: Number,
      required: true
    },
    savedNotes: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    filteredSavedNotes() {
      return this.savedNotes.filter(note => note.question_id === this.questionId);
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      return new Intl.DateTimeFormat('zh-CN', options).format(new Date(dateString));
    },
    deleteNote(note_id) {
      this.$emit('delete-note', note_id);
    }
  }
};
</script>

<style scoped>
.history-tab-content {
  color: lightgray;
}

.history-tab-content .saved-note-item {
  border-bottom: 1px solid #666;
  padding-bottom: 10px;
  margin-bottom: 10px;
  display: flex; /* Added to align items */
  justify-content: space-between; /* Added to push button to the end */
  align-items: center; /* Added to vertically align items */
}

.history-tab-content .saved-note-text {
  font-size: 1rem;
  margin-bottom: 5px;
}

.history-tab-content .saved-note-date {
  font-size: 0.8rem;
  color: #999;
}

.history-tab-content .saved-note-date {
  color: #007bff; /* You can choose any color you find clearer */
}
</style>