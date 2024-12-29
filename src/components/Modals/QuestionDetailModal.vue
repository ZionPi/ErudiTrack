<template>
  <div :class="modalClass" v-if="isOpen">
    <div class="question-detail-modal-content">
      <span class="question-detail-close" @click="close">×</span>
      <h2 class="question-detail-header">{{ question.question_text }}</h2>
      <div class="question-detail-actions">
        <button class="button" @click="selectAllText">全选</button>
        <!-- 保存按钮现在在笔记的 tab content 里 -->
      </div>

      <div class="question-detail-tabs">
        <button class="question-detail-tab-item" :class="{ active: activeTab === 'textarea' }"
                @click="activeTab = 'textarea'">笔记</button>
        <button class="question-detail-tab-item" :class="{ active: activeTab === 'hints' }"
                @click="activeTab = 'hints'">提示</button>
        <button class="question-detail-tab-item" :class="{ active: activeTab === 'history' }"
                @click="activeTab = 'history'">历史解答</button>
        <button class="question-detail-tab-item" :class="{ active: activeTab === 'answer' }"
                @click="activeTab = 'answer'">标准答案</button>
        <button class="question-detail-tab-item" :class="{ active: activeTab === 'truefalse' }"
                @click="activeTab = 'truefalse'">判断题</button>
        <button class="question-detail-tab-item" :class="{ active: activeTab === 'multiplechoice' }"
                @click="activeTab = 'multiplechoice'">选择题</button>
        <button class="question-detail-tab-item" :class="{ active: activeTab === 'fillblank' }"
                @click="activeTab = 'fillblank'">填空题</button>
        <button class="question-detail-tab-item" :class="{ active: activeTab === 'analysis' }"
                @click="activeTab = 'analysis'">深度解析</button>
      </div>

      <div class="question-detail-tab-content note-tab-content" v-if="activeTab === 'textarea'">
        <textarea class="question-detail-textarea" v-model="detailText"
                  placeholder="在这里写下你的想法、笔记和灵感...可以尝试回答问题，记录思路，或者仅仅是随意的涂鸦。尽情发挥你的创造力吧！"></textarea>
        <div class="save-status-message" v-if="saveStatus">{{ saveStatus }}</div>
        <button class="button is-primary save-note-button" @click="saveNote">保存</button>
      </div>
      <div class="question-detail-tab-content" v-if="activeTab === 'hints'">
        这里是提示内容。
      </div>
      <div class="question-detail-tab-content history-tab-content" v-if="activeTab === 'history'">
        <div v-if="filteredSavedNotes.length === 0">
          还没有保存过针对这道题的解答。
        </div>
        <ul v-else>
          <li v-for="(note, index) in filteredSavedNotes" :key="index" class="saved-note-item">
            <p class="saved-note-text">{{ note.text }}</p>
            <p class="saved-note-date">{{ formatDate(note.timestamp) }}</p>
          </li>
        </ul>
      </div>
      <div class="question-detail-tab-content" v-if="activeTab === 'answer'">
        这里是标准答案。
      </div>
      <div class="question-detail-tab-content" v-if="activeTab === 'truefalse'">
        这里是判断题内容。
      </div>
      <div class="question-detail-tab-content" v-if="activeTab === 'multiplechoice'">
        这里是选择题内容。
      </div>
      <div class="question-detail-tab-content" v-if="activeTab === 'fillblank'">
        这里是填空题内容。
      </div>
      <div class="question-detail-tab-content" v-if="activeTab === 'analysis'">
        这里是深度解析。
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionDetailModal',
  props: {
    isOpen: Boolean,
    question: {
      type: Object,
      default: () => ({ question_text: '', id: null }) // Ensure question has an ID
    },
    isFullScreen: Boolean
  },
  data() {
    return {
      detailText: '',
      activeTab: 'textarea',
      savedNotes: [],
      saveStatus: '' // 用于显示保存状态消息
    };
  },
  computed: {
    modalClass() {
      return {
        'question-detail-modal': true,
        'fullscreen': this.isFullScreen
      };
    },
    filteredSavedNotes() {
      return this.savedNotes.filter(note => note.questionId === this.question.id);
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    selectAllText() {
      const textarea = document.querySelector('.question-detail-textarea');
      if (textarea) {
        textarea.select();
      }
    },
    saveNote() {
      if (this.detailText.trim() !== '' && this.question.id !== null) {
        this.savedNotes.push({
          questionId: this.question.id, // 保存关联的 question ID
          text: this.detailText,
          timestamp: new Date()
        });
        this.saveStatus = '保存成功！';
        setTimeout(() => {
          this.saveStatus = '';
        }, 2000); // 2秒后清除消息
      }
    },
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      return new Intl.DateTimeFormat('zh-CN', options).format(date);
    }
  }
};
</script>

<style scoped>
.question-detail-modal.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.question-detail-modal.fullscreen .question-detail-modal-content {
  background-color: black;
  border-radius: 0;
  box-shadow: none;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.question-detail-modal.fullscreen .question-detail-header {
  color: white;
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: none;
}

.question-detail-modal.fullscreen .question-detail-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.question-detail-modal.fullscreen .question-detail-actions .button {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.2rem;
}

.question-detail-tabs {
  display: flex;
  border-bottom: 1px solid #555;
  margin-bottom: 20px;
  background-color: #333;
}

.question-detail-tab-item {
  padding: 10px 15px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  color: #ccc;
  border-bottom: 2px solid transparent;
  transition: border-bottom-color 0.3s ease, color 0.3s ease;
  margin-right: 5px;
}

.question-detail-tab-item.active {
  border-bottom-color: #007bff;
  color: white;
  font-weight: bold;
}

.question-detail-tab-item:hover {
  background-color: #555;
  color: white;
}

.question-detail-tab-content {
  padding: 10px;
  flex-grow: 1;
  overflow: auto;
  height: calc(100% - 50px);
  position: relative; /* Add relative positioning for absolute child */
}

.note-tab-content {
  display: flex;
  flex-direction: column;
}

.question-detail-textarea {
  flex-grow: 1;
  padding: 20px;
  border: none;
  background-color: black;
  color: lightgray;
  font-size: 2rem;
  line-height: 1.6;
  resize: none;
  outline: none;
  overflow: auto;
  width: 100%;
  /* Ensure textarea takes available height, leaving space for the button */
  margin-bottom: 60px; /* Adjust as needed based on button height and desired spacing */
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
  bottom: 50px; /* 调整显示位置 */
  left: 10px;
  color: green;
  font-size: 1rem;
}

.history-tab-content {
  color: lightgray; /* Default light color for history tab content */
}

.question-detail-modal.fullscreen .history-tab-content {
  color: white; /* Ensure white color in fullscreen mode */
}

.saved-note-item {
  border-bottom: 1px solid #666; /* Slightly lighter border for dark background */
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.saved-note-text {
  font-size: 1rem;
  margin-bottom: 5px;
}

.saved-note-date {
  font-size: 0.8rem;
  color: #999; /* Slightly lighter date color for dark background */
}
</style>