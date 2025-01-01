<template>
  <div :class="modalClass" v-if="isOpen" @keydown.meta.enter="saveNote" @keydown.ctrl.enter="saveNote"
    @keydown.meta.g.prevent="generateContent('answer')" @keydown.ctrl.g.prevent="generateContent('answer')"
    @keydown.meta.s.prevent="saveContent('answer')" @keydown.ctrl.s.prevent="saveContent('answer')"
    @keydown.exact="handleKeyDown">

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
        <button class="button answer-action-button generate-button" @click="generateContent('answer')"
          :disabled="isLoading.answer">
          生成
          <span v-if="isLoading.answer" class="loading-spinner"></span>
        </button>
        <button class="button is-primary answer-action-button save-answer-button"
          @click="saveContent('answer')">保存</button>
      </div>

      <div class="question-detail-tab-content derived-question-tab-content" v-if="activeTab === 'truefalse'">
        <div v-if="generatedTrueFalse">
          <p class="derived-question-text">{{ generatedTrueFalse.question }}</p>
          <p class="derived-question-answer">答案: {{ generatedTrueFalse.answer }}</p>
        </div>
        <div v-else>
          判断题内容
        </div>
        <button class="button derived-action-button generate-button" @click="generateContent('truefalse')"
          :disabled="isLoading.truefalse">
          生成
          <span v-if="isLoading.truefalse" class="loading-spinner"></span>
        </button>
        <button class="button is-primary derived-action-button save-button"
          @click="saveContent('truefalse')">保存</button>
      </div>

      <div class="question-detail-tab-content derived-question-tab-content" v-if="activeTab === 'multiplechoice'">
        <div v-if="generatedMultipleChoice">
          <p class="derived-question-text">{{ generatedMultipleChoice.question }}</p>
          <ul>
            <li v-for="(option, index) in generatedMultipleChoice.options" :key="index">
              <label>
                <input type="radio" :value="option.text" :name="'multiple-choice-' + question.question_id"
                  :disabled="false" :checked="option.is_correct">
                {{ option.text }} <span v-if="option.is_correct">(正确答案)</span>
              </label>
            </li>
          </ul>
        </div>
        <div v-else>
          选择题内容
        </div>
        <button class="button derived-action-button generate-button" @click="generateContent('multiplechoice')"
          :disabled="isLoading.multiplechoice">
          生成
          <span v-if="isLoading.multiplechoice" class="loading-spinner"></span>
        </button>
        <button class="button is-primary derived-action-button save-button"
          @click="saveContent('multiplechoice')">保存</button>
      </div>

      <div class="question-detail-tab-content derived-question-tab-content" v-if="activeTab === 'fillblank'">
        <div v-if="generatedFillBlank">
          <p class="derived-question-text" v-html="renderFillBlankQuestion">
          </p>
          <p v-for="blank in generatedFillBlank.blanks" :key="blank.order">
            <strong>答案 {{ blank.order }}:</strong> {{ blank.answer }}
          </p>
        </div>
        <div v-else>
          填空题内容
        </div>
        <button class="button derived-action-button generate-button" @click="generateContent('fillblank')"
          :disabled="isLoading.fillblank">
          生成
          <span v-if="isLoading.fillblank" class="loading-spinner"></span>
        </button>
        <button class="button is-primary derived-action-button save-button"
          @click="saveContent('fillblank')">保存</button>
      </div>

    </div>
  </div>
</template>

<script>
import {
  generateAnswer, saveAnswer, generateTrueFalse, generateMultipleChoice, generateFillBlank,
  createDerivedTrueFalseQuestion, createDerivedMultipleChoiceQuestion, createDerivedFillInTheBlankQuestion,
  fetchDerivedTrueFalseQuestions,
  fetchDerivedMultipleChoiceQuestions,
  fetchDerivedFillInTheBlankQuestions
} from '@/services/apiService'; // 引入 API 服务
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
      isLoading: {
        answer: false,
        truefalse: false,
        multiplechoice: false,
        fillblank: false
      },
      generatedTrueFalse: null,
      generatedMultipleChoice: null,
      generatedFillBlank: null,
      derivedTrueFalseQuestions: [],
      derivedMultipleChoiceQuestions: [],
      derivedFillBlankQuestions: []
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
      return this.question.question_prompt ? marked(this.question.question_prompt) : 'sorry,no answer now.';
    },
    renderFillBlankQuestion() {
      if (this.generatedFillBlank && this.generatedFillBlank.question) {
        return this.generatedFillBlank.question.replace(/\( \)/g, (match, index) => {
          const blankNumber = (index / match.length) + 1; // Calculate blank number
          return `<input type="text" class="fill-blank-input" :placeholder="'答案' + ${blankNumber}" disabled>`;
        });
      }
      return '';
    }
  },
  watch: {

   async activeTab(newTab) {
      if (newTab === 'truefalse') {
        await this.getTrueFalseHistory();
        if (this.derivedTrueFalseQuestions.length > 0) {
          const randomNote = this.derivedTrueFalseQuestions[Math.floor(Math.random() * this.derivedTrueFalseQuestions.length)];
          this.generatedTrueFalse = {
            question: randomNote.derived_question_text, // Use the correct property name from your API response
            answer: randomNote.correct_answer     // Use the correct property name from your API response
          };
        } else {
          this.generatedTrueFalse = null; // Or some default value if no history
        }
      } else if (newTab === 'multiplechoice') {
        await this.getMultipleChoiceHistory();
        if (this.derivedMultipleChoiceQuestions.length > 0) {
          const randomNote = this.derivedMultipleChoiceQuestions[Math.floor(Math.random() * this.derivedMultipleChoiceQuestions.length)];
          // Assuming derivedMultipleChoiceQuestions elements have question and options
              this.generatedMultipleChoice = {
                question: randomNote.derived_question_text, // Assuming question_text is the correct property
                options: randomNote.options.map(option => ({
                  text: option.option_text,
                  is_correct: option.is_correct // Map s_correct
                }))
          };
        } else {
          this.generatedMultipleChoice = null;
        }
      } else if (newTab === 'fillblank') {
        await this.getFillBlankHistory();
        if (this.derivedFillBlankQuestions.length > 0) {
          const randomNote = this.derivedFillBlankQuestions[Math.floor(Math.random() * this.derivedFillBlankQuestions.length)];
          // Assuming derivedFillBlankQuestions elements have question and blanks
          this.generatedFillBlank = {
            question: randomNote.derived_question_text, // Assuming question_text is the correct property
            blanks: randomNote.blanks.map(blank => ({
              order: blank.blank_order, // Map blank_order
              answer: blank.correct_answer_pattern // Map correct_answer_pattern
            }))
          };
        } else {
          this.generatedFillBlank = null;
        }
      }
    },
    question() {
      this.detailText = ''; // 当 question prop 变化时，清空 detailText
      this.fetchDerivedQuestionData(); // Fetch all types when the main question changes
    }
  },
  mounted() {
    // 在组件挂载后，尝试从 localStorage 加载 savedNotes
    const storedNotes = localStorage.getItem('savedNotes');
    if (storedNotes) {
      this.savedNotes = JSON.parse(storedNotes).map(note => ({
        ...note,
        timestamp: new Date(note.timestamp) // 将 timestamp 字符串转换为 Date 对象
      }));
    }
  },
  methods: {
    async fetchDerivedQuestionData() {
      if (this.question.question_id) {
        this.getTrueFalseHistory();
        this.getMultipleChoiceHistory();
        this.getFillBlankHistory();
      }
    },
    async getTrueFalseHistory() {
      try {
        this.derivedTrueFalseQuestions = await fetchDerivedTrueFalseQuestions(this.question.question_id);
        console.log('Fetched True/False History:', this.derivedTrueFalseQuestions);
      } catch (error) {
        console.error('Error fetching True/False history:', error);
      }
    },
    async getMultipleChoiceHistory() {
      try {
        this.derivedMultipleChoiceQuestions = await fetchDerivedMultipleChoiceQuestions(this.question.question_id);
        console.log('Fetched Multiple Choice History:', this.derivedMultipleChoiceQuestions);
      } catch (error) {
        console.error('Error fetching Multiple Choice history:', error);
      }
    },
    async getFillBlankHistory() {
      try {
        this.derivedFillBlankQuestions = await fetchDerivedFillInTheBlankQuestions(this.question.question_id);
        console.log('Fetched Fill-in-the-Blank History:', this.derivedFillBlankQuestions);
      } catch (error) {
        console.error('Error fetching Fill-in-the-Blank history:', error);
      }
    },
    handleKeyDown(event) {
      if (event.key === ' ') { // 检查按下的键是否是空格键
        event.stopPropagation(); // 阻止事件冒泡到父组件
      }
    },
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
      }
    },
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      return new Intl.DateTimeFormat('zh-CN', options).format(date);
    },
    async generateContent(contentType) {
      this.isLoading[contentType] = true;
      try {
        let apiFunction;
        switch (contentType) {
          case 'answer':
            apiFunction = generateAnswer;
            break;
          case 'truefalse':
            apiFunction = generateTrueFalse;
            break;
          case 'multiplechoice':
            apiFunction = generateMultipleChoice;
            break;
          case 'fillblank':
            apiFunction = generateFillBlank;
            break;
          default:
            console.error('未知的 content type:', contentType);
            return;
        }

        const content = await apiFunction(this.question.question_text);
        console.log(`生成 ${contentType} 成功`, content);


        if (contentType === 'truefalse') {
          this.generatedTrueFalse = content;
        } else if (contentType === 'multiplechoice') {
          this.generatedMultipleChoice = content; // Store multiple choice data
        } else if (contentType === 'fillblank') {
          this.generatedFillBlank = content;     // Store fill in the blank data
        }


        this.$emit(`update-question-${contentType}`, content); // 根据内容类型 emit 事件
      } catch (error) {
        console.error(`生成 ${contentType} 失败`, error);
        alert(`生成 ${contentType} 失败，请稍后重试。`);
      } finally {
        this.isLoading[contentType] = false;
      }
    },

    async saveContent(contentType) {

      const questionId = this.question.question_id;
      if (!questionId) {
        console.error('Question ID is missing.');
        alert('无法保存，缺少题目ID。');
        return;
      }

      try {
        let apiFunction;
        switch (contentType) {
          case 'answer':
            apiFunction = saveAnswer;
            await apiFunction(questionId, this.question.question_prompt); // Pass questionId and prompt
            break;
          case 'truefalse':
            apiFunction = createDerivedTrueFalseQuestion;
            await apiFunction( // Pass arguments individually
              questionId,
              this.generatedTrueFalse.question,
              this.generatedTrueFalse.answer
            );
            break;
          case 'multiplechoice':
            apiFunction = createDerivedMultipleChoiceQuestion;

            var formattedOptions = this.generatedMultipleChoice.options.map(option => ({
              option_text: option.text,
              is_correct: option.is_correct
            }));

            await apiFunction( // Pass arguments individually
              questionId,
              this.generatedMultipleChoice.question,
              formattedOptions
            );
            break;
          case 'fillblank':
            apiFunction = createDerivedFillInTheBlankQuestion;

            var formattedBlanks = this.generatedFillBlank.blanks.map(blank => ({
              blank_order: blank.order,
              correct_answer_pattern: blank.answer // Assuming 'answer' holds the correct answer
            }));
            await apiFunction(
              questionId,
              this.generatedFillBlank.question,
              formattedBlanks
            );

            break;
          default:
            console.error('未知的 content type:', contentType);
            return;
        }

        this.saveStatus = `${contentType} 保存成功！`;
        setTimeout(() => {
          this.saveStatus = '';
        }, 2000);

        showSuccessNotification(this.$notify, `${contentType} 保存成功！`, contentType === 'answer' ? '答案' : '衍生问题');

      } catch (error) {
        console.error(`${contentType} 保存失败`, error);
        alert(`保存失败: ${error.message || error}`);
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
  background-color: rgb(101, 160, 7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.question-detail-modal.fullscreen .question-detail-modal-content {
  background-color: rgb(101, 160, 7);
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
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  color: #aaa;
  cursor: pointer;
  z-index: 10;
}

.question-detail-close:hover {
  color: #fff;
}

.question-detail-modal.fullscreen .question-detail-close {
  color: white;
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
  background-color: rgb(101, 160, 7);
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
  position: relative;
}

.note-tab-content {
  display: flex;
  flex-direction: column;
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
  margin-bottom: 60px;
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

.history-tab-content {
  color: lightgray;
}

.question-detail-modal.fullscreen .history-tab-content {
  color: white;
}

.saved-note-item {
  border-bottom: 1px solid #666;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.saved-note-text {
  font-size: 1rem;
  margin-bottom: 5px;
}

.saved-note-date {
  font-size: 0.8rem;
  color: #999;
}

.answer-tab-content {
  position: relative;
  color: lightgray;
}

.question-detail-modal.fullscreen .answer-tab-content {
  color: white;
}

.markdown-body {
  color: #f0f0f0;
  font-size: 1rem;
  line-height: 1.6;
}

.question-detail-tab-content.answer-tab-content .markdown-body.scrollable-content li p strong {
  color: red;
}

.scrollable-content {
  color: #f0f0f0;
  font-size: 1rem;
  line-height: 1.6;
  overflow-y: auto;
  max-height: calc(100% - 60px);
  padding-bottom: 70px;
}

.markdown-body pre code {
  background-color: #282c34;
  color: #abb2bf;
  padding: 10px;
  border-radius: 5px;
  display: block;
  overflow-x: auto;
}

.markdown-body code {
  background-color: #3e4451;
  color: #d19a66;
  padding: 2px 5px;
  border-radius: 3px;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  color: white;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-body a {
  color: #61afe6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body ul,
.markdown-body ol {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  padding-left: 20px;
}

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
  right: 100px;
  background-color: #4CAF50;
  color: white;
}

.answer-action-button.save-answer-button {
  background-color: #007bff;
  color: white;
}

/* 新增的衍生问题类型的样式 */
.derived-question-tab-content {
  position: relative;
  /* 确保按钮相对于此容器定位 */
  padding-bottom: 60px;
  /* 为按钮留出空间 */
  color: lightgray;
}

.question-detail-modal.fullscreen .derived-question-tab-content {
  color: white;
}

.derived-action-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 10px 20px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.derived-action-button.generate-button {
  right: 100px;
  /* 调整与保存按钮的间距 */
  background-color: #4CAF50;
  color: white;
}

.derived-action-button.save-button {
  background-color: #007bff;
  color: white;
}

.loading-spinner {
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 5px solid #fff;
  width: 1.2em;
  height: 1.2em;
  animation: spin 1s linear infinite;
  margin-left: 0.5em;
}

.markdown-body mark strong {
  color: blue;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>