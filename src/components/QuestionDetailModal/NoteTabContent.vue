<template>
  <div class="note-tab-content" @keydown.meta.enter="saveNote" @keydown.ctrl.enter="saveNote">
    <textarea
      class="question-detail-textarea"
      v-model="detailText"
      placeholder="在这里写下你的想法、笔记和灵感...可以尝试回答问题，记录思路，或者仅仅是随意的涂鸦。尽情发挥你的创造力吧！"
    ></textarea>
    <div class="save-status-message" v-if="saveStatus">{{ saveStatus }}</div>
    <button class="button is-primary save-note-button" @click="saveNote">保存</button>
  </div>
</template>

<script>
import { showSuccessNotification } from '@/utils/helper'; // 导入通知函数

export default {
  name: 'NoteTabContent',
  props: {
    questionId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      detailText: '',
      savedNotes: [],
      saveStatus: '',
    };
  },
  computed: {
    filteredSavedNotes() {
      return this.savedNotes.filter((note) => note.questionId === this.questionId);
    },
  },
  mounted() {
    this.loadSavedNotes();
  },
  methods: {
    loadSavedNotes() {
      const storedNotes = localStorage.getItem('savedNotes');
      if (storedNotes) {
        this.savedNotes = JSON.parse(storedNotes).map((note) => ({
          ...note,
          timestamp: new Date(note.timestamp),
        }));
      }
    },
    saveNote() {
      if (this.detailText.trim() !== '' && this.questionId !== null) {
        const newNote = {
          questionId: this.questionId,
          text: this.detailText,
          timestamp: new Date(),
        };
        this.savedNotes.push(newNote);
        this.saveNotesToLocalStorage();
        this.showSaveSuccessNotification();
        this.$emit('note-saved', newNote); // THIS LINE IS ADDED
        this.detailText = ''; // Clear the textarea after saving
      }
    },
    saveNotesToLocalStorage() {
      localStorage.setItem('savedNotes', JSON.stringify(this.savedNotes));
    },
    showSaveSuccessNotification() {
      showSuccessNotification(this.$notify, '笔记保存成功！');
    },
    formatDate(date) {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      };
      return new Intl.DateTimeFormat('zh-CN', options).format(date);
    },
    deleteNote(index) {
      this.savedNotes.splice(index, 1);
      this.saveNotesToLocalStorage();
    },
  },
};
</script>

<style scoped>
.note-tab-content {
  display: flex;
  flex-direction: column;
  height: 100%; /* Occupy the full height of the tab content */
  position: relative; /* For positioning the save button */
}

.question-detail-textarea {
  flex-grow: 1;
  padding: 20px;
  border: none;
  background-color: rgb(101, 160, 7);
  color: lightgray;
  font-size: 2rem;
  line-height: 1.6;
  resize: none;
  outline: none;
  overflow: auto;
  width: 100%;
  margin-bottom: 60px; /* Space for the save button */
}

/* Style for fullscreen mode */
.question-detail-modal.fullscreen .question-detail-textarea {
  background-color: rgb(101, 160, 7);
  color: white;
}

.save-note-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 10px 20px;
  font-size: 1rem;
}

.save-status-message {
  position: absolute;
  bottom: 50px;
  left: 10px;
  color: green;
  font-size: 1rem;
  z-index: 10001;
}
</style>