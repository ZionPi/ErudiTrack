<template>
  <div :class="modalClass" v-if="isOpen" @keydown.meta.enter="saveNote" @keydown.ctrl.enter="saveNote">

    <div class="question-detail-modal-content">
      <span class="question-detail-close" @click="close">×</span>
      <h2 class="question-detail-header">{{ question.question_text }}</h2>
      <div class="question-detail-actions" v-if="!isFullScreen">
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
        <!-- <div class="save-status-message" v-if="saveStatus">{{ saveStatus }}</div> -->
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
      <div class="question-detail-tab-content answer-tab-content" v-if="activeTab === 'answer'">
        <div class="markdown-body scrollable-content" v-html="renderedAnswer"></div>
        <button class="button answer-action-button generate-button" @click="generateAnswer" :disabled="isLoadingAnswer">
          生成
          <span v-if="isLoadingAnswer" class="loading-spinner"></span>
        </button>
        <button class="button is-primary answer-action-button save-answer-button" @click="saveAnswer">保存</button>
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
import { generateAnswer ,saveAnswer} from '@/services/apiService'; // 引入 API 服务
import { marked } from 'marked'; // 引入 marked 库
import { showSuccessNotification } from '@/utils/helper'; // 导入通知函数

export default {
  name: 'QuestionDetailModal',
  props: {
    isOpen: Boolean,
    question: {
      type: Object,
      default: () => ({ question_text: '', question_id: null, question_prompt: '' }) // Ensure question has an ID
    },
    isFullScreen: Boolean
  },
  data() {
    return {
      detailText: '',
      activeTab: 'textarea',
      savedNotes: [],
      saveStatus: '', // 用于显示保存状态消息
      isLoadingAnswer: false // 新增 loading 状态
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
      return this.savedNotes.filter(note => note.questionId === this.question.question_id);
    },
    renderedAnswer() {
      return this.question.question_prompt ? marked(this.question.question_prompt) : '';
    }
  },
  watch: {
    question() {
      this.detailText = ''; // 当 question prop 变化时，清空 detailText
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
      if (this.detailText.trim() !== '' && this.question.question_id !== null) {
        const newNote = {
          questionId: this.question.question_id,
          text: this.detailText,
          timestamp: new Date()
        };
        this.savedNotes.push(newNote);
        // 将更新后的 savedNotes 保存到 localStorage
        localStorage.setItem('savedNotes', JSON.stringify(this.savedNotes));

        showSuccessNotification(this.$notify, '笔记保存成功！'); // 调用 helper 函数并传递 $notify


        // this.saveStatus = '保存成功！';
        // setTimeout(() => {
        //   this.saveStatus = '';
        // }, 2000);
      }
    },
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      return new Intl.DateTimeFormat('zh-CN', options).format(date);
    },
    async generateAnswer() {
      this.isLoadingAnswer = true; // 开始加载时设置为 true
      try {
        const answer = await generateAnswer(this.question.question_text);
        console.log('生成答案成功', answer);
        this.$emit('update-question-prompt', answer); // Emit an event
      } catch (error) {
        console.error('生成答案失败', error);
        alert('生成答案失败，请稍后重试。');
      } finally {
        this.isLoadingAnswer = false; // 无论成功或失败，加载结束后设置为 false
      }
    },
    async saveAnswer() {
        const questionId = this.question.question_id;
        const newPrompt = this.question.question_prompt;

        if (!questionId) {
          console.error('Question ID is missing.');
          alert('无法保存，缺少题目ID。');
          return;
        }

        try {
          const response = await saveAnswer(questionId, newPrompt);
          console.log('答案保存成功', response.message);
          this.saveStatus = '答案保存成功！';
          setTimeout(() => {
            this.saveStatus = '';
          }, 2000);

          showSuccessNotification(this.$notify, '答案保存成功！', '答案'); // 调用 helper 函数并传递 $notify


        } catch (error) {
          console.error('答案保存失败', error);
          alert(`答案保存失败: ${error.message || error}`); // 错误对象可能直接是message
        }
    }
  }
};
</script>

<style scoped>
/* 现有的样式保持不变 */
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
  z-index: 100;
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

.question-detail-close {
  position: absolute; /* Use absolute positioning */
  top: 10px;      /* Adjust as needed */
  right: 10px;     /* Adjust as needed */
  font-size: 1.5rem; /* Make it easily clickable */
  color: #aaa;      /* Style it as needed */
  cursor: pointer;
  z-index: 10;     /* Ensure it's above other content */
}

.question-detail-close:hover {
  color: #fff;
}

.question-detail-modal.fullscreen .question-detail-close {
  color: white; /* Ensure visibility in fullscreen mode */
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
  z-index: 10001;
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

.answer-tab-content {
  position: relative; /* To position the buttons absolutely within this */
  color: lightgray;
}

.question-detail-modal.fullscreen .answer-tab-content {
  color: white;
}

/* Style for the Markdown content */
.markdown-body {
  color: #f0f0f0; /* Light text color for better visibility on dark background */
  font-size: 1rem;
  line-height: 1.6;
}

.question-detail-tab-content.answer-tab-content .markdown-body.scrollable-content li p strong {
  color: red;
}

.scrollable-content {
  color: #f0f0f0; /* Light text color for better visibility on dark background */
  font-size: 1rem;
  line-height: 1.6;
  overflow-y: auto; /* Enable vertical scrolling */
  max-height: calc(100% - 60px); /* Adjust based on the height of the buttons and desired spacing */
  padding-bottom: 70px; /* Add padding to ensure content isn't hidden by fixed buttons */
}

/* Style for code blocks within Markdown */
.markdown-body pre code {
  background-color: #282c34; /* Darker background for code blocks */
  color: #abb2bf; /* Lighter text color for code */
  padding: 10px;
  border-radius: 5px;
  display: block; /* Ensure code blocks take full width */
  overflow-x: auto; /* Enable horizontal scrolling for long code lines */
}

/* Style for inline code within Markdown */
.markdown-body code {
  background-color: #3e4451;
  color: #d19a66;
  padding: 2px 5px;
  border-radius: 3px;
}

/* Style for headings within Markdown */
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
  color: white;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

/* Style for links within Markdown */
.markdown-body a {
  color: #61afe6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

/* Style for lists within Markdown */
.markdown-body ul, .markdown-body ol {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  padding-left: 20px;
}

/* Style for blockquotes within Markdown */
.markdown-body blockquote {
  border-left: 5px solid #555;
  padding-left: 15px;
  margin: 1.5em 10px;
  font-style: italic;
  color: #ccc;
}


.answer-action-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 10px 20px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-action-button.generate-button {
  right: 100px; /* Adjust spacing between buttons */
  background-color: #4CAF50;
  color: white;
}

.answer-action-button.save-answer-button {
  background-color: #007bff;
  color: white;
}

/* Loading Spinner Animation */
.loading-spinner {
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 5px solid #fff;
  width: 1.2em;
  height: 1.2em;
  animation: spin 1s linear infinite;
  margin-left: 0.5em;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>