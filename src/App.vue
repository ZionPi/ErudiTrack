<template>
  <div id="app" :class="{ selected: isCurrentQuestionSelected, highlighted: isCurrentQuestionInSelected }">
    <h1 class="header-title" @click.stop="openJumpToQuestionModal" style="cursor: pointer;">
      题目{{ currentQuestion.question_id }}
      <div class="type-tag-container">
        <button class="type-tag-button" @click.stop="openCategoryModal">
          <span class="type-tag"
                :style="{ backgroundColor: getTypeColor(currentQuestion.question_type), color: getTypeTextColor(currentQuestion.question_type) }">
            #{{ currentQuestion.question_type }}
          </span>
        </button>
      </div>
    </h1>
    <div class="top-right-controls">
      <button class="button is-small" @click.stop="startFullscreenMode">
        <span class="icon">
          <i class="fas fa-play"></i>
        </span>
      </button>
      <button class="button is-small" @click.stop="openSettingsModal">
        <span class="icon">
          <i class="fas fa-cog"></i>
        </span>
      </button>
      <div class="filter-button-container">
        <button class="button is-small" :style="{ backgroundColor: filterButtonColor }"
                @click.stop="openFilterModal">
          <span class="icon">
            <i class="fas fa-list"></i>
          </span>
        </button>
      </div>
      <div class="timer-controls">
        <label for="countdown-duration">倒计时:</label>
        <input id="countdown-duration" type="number" v-model.number="countdownDuration" min="1"
               class="input is-small" style="width: 60px;">
        <span style="margin-left: 5px; color: #777; font-size: 0.9rem;">秒</span>
      </div>
      <div class="mode-select">
        <div class="select is-small">
          <select v-model="mode" @change="resetCurrentIndex">
            <option value="sequential">顺序模式</option>
            <option value="random">随机模式</option>
          </select>
        </div>
        <div class="control">
          <label class="checkbox">
            <input type="checkbox" v-model="isCategoryModeActive" @change="resetCurrentIndex">
            类别模式
          </label>
        </div>
      </div>
    </div>

    <div class="question-container">
      <countdown-timer :is-running="!isQuestionDetailModalOpen" :initial-seconds="countdownDuration"
                       :start-trigger="String(currentQuestion.question_id)" @timeup="nextQuestion"></countdown-timer>
      <div v-if="loading">
        <p>加载中...</p>
      </div>
      <div v-else-if="error">
        <p>获取题目数据失败，请检查控制台错误信息。</p>
      </div>
      <div v-else>
        <p ref="contentRef"
           :class="{ 'content': true, 'bookmarked': bookmarkedQuestionIds.includes(currentQuestion.question_id) }"
           @click="openQuestionDetailModal">{{ currentQuestion.question_text }}</p>
      </div>
    </div>

    <div class="button-container">
      <button class="button is-link prev-button" @click="prevQuestion">上一题</button>
      <button class="button is-link next-button" @click="nextQuestion">下一题</button>
    </div>


    <category-modal
      :is-open="isCategoryModalOpen"
      :question-types="uniqueQuestionTypes"
      :type-color="getTypeColor"
      :type-text-color="getTypeTextColor"
      @close="closeCategoryModal"
      @select="selectCategory"
    />
 
   <filter-modal
      :is-open="isFilterModalOpen"
      :bookmarks="bookmarks"
      :selected-questions="selectedQuestions"
      @close="closeFilterModal"
      @jump-to-selected="jumpToSelectedQuestion"
      @remove-selected="removeSelectedQuestion"
      @import="handleImportedQuestions"
      @export="exportSelectedQuestions"
      @remove-all-selected="removeAllSelectedQuestions"
    />

    <!-- Settings Modal -->
    <div class="settings-modal" v-if="isSettingsModalOpen">
      <div class="settings-modal-content">
        <div class="settings-modal-header">
          <h2 class="title is-4">设置</h2>
          <span class="settings-modal-close" @click="closeSettingsModal">×</span>
        </div>
        <div class="settings-group">
          <label for="initial-countdown">初始倒计时时长 (秒)</label>
          <input id="initial-countdown" type="number" class="input"
                 v-model.number="appSettings.countdownDuration">
        </div>
        <div class="settings-group">
          <label for="default-mode">默认模式</label>
          <div class="select is-fullwidth">
            <select id="default-mode" v-model="appSettings.defaultMode">
              <option value="sequential">顺序模式</option>
              <option value="random">随机模式</option>
            </select>
          </div>
        </div>
        <div class="settings-group">
          <label class="checkbox">
            <input type="checkbox" v-model="appSettings.enableCategoryMode">
            启用类别模式
          </label>
        </div>

        <!-- 新增的复选框 -->
        <div class="settings-group">
          <label class="checkbox">
            <input type="checkbox" v-model="appSettings.resumeLastPosition">
            从上次停止的位置开始浏览
          </label>
        </div>

        <div class="settings-actions">
          <button class="button is-success" @click="saveSettings">保存</button>
          <button class="button" @click="restoreDefaultSettings">恢复默认</button>
        </div>
      </div>
    </div>

    <!-- Question Detail Modal -->
    <div :class="modalClass" v-if="isQuestionDetailModalOpen">
      <div class="question-detail-modal-content">
        <span class="question-detail-close" @click="closeQuestionDetailModal">×</span>
        <h2 class="question-detail-header">{{ currentQuestion.question_text }}</h2>
        <div class="question-detail-actions">
          <button class="button" @click="selectAllQuestionText">全选</button>
          <button class="button is-primary" @click="saveDetailText">保存</button>
        </div>

        <div class="question-detail-tabs">
          <button class="question-detail-tab-item" :class="{ active: activeDetailTab === 'textarea' }"
                  @click="activeDetailTab = 'textarea'">笔记</button>
          <button class="question-detail-tab-item" :class="{ active: activeDetailTab === 'hints' }"
                  @click="activeDetailTab = 'hints'">提示</button>
          <button class="question-detail-tab-item" :class="{ active: activeDetailTab === 'history' }"
                  @click="activeDetailTab = 'history'">历史解答</button>
          <button class="question-detail-tab-item" :class="{ active: activeDetailTab === 'answer' }"
                  @click="activeDetailTab = 'answer'">标准答案</button>
          <button class="question-detail-tab-item" :class="{ active: activeDetailTab === 'truefalse' }"
                  @click="activeDetailTab = 'truefalse'">判断题</button>
          <button class="question-detail-tab-item" :class="{ active: activeDetailTab === 'multiplechoice' }"
                  @click="activeDetailTab = 'multiplechoice'">选择题</button>
          <button class="question-detail-tab-item" :class="{ active: activeDetailTab === 'fillblank' }"
                  @click="activeDetailTab = 'fillblank'">填空题</button>
          <button class="question-detail-tab-item" :class="{ active: activeDetailTab === 'analysis' }"
                  @click="activeDetailTab = 'analysis'">深度解析</button>
        </div>

        <div class="question-detail-tab-content" v-if="activeDetailTab === 'textarea'">
          <textarea class="question-detail-textarea" v-model="detailText"
                    placeholder="在这里写下你的想法、笔记和灵感...可以尝试回答问题，记录思路，或者仅仅是随意的涂鸦。尽情发挥你的创造力吧！"></textarea>
        </div>
        <div class="question-detail-tab-content" v-if="activeDetailTab === 'hints'">
          这里是提示内容。
        </div>
        <div class="question-detail-tab-content" v-if="activeDetailTab === 'history'">
          这里是历史解答。
        </div>
        <div class="question-detail-tab-content" v-if="activeDetailTab === 'answer'">
          这里是标准答案。
        </div>
        <div class="question-detail-tab-content" v-if="activeDetailTab === 'truefalse'">
          这里是判断题内容。
        </div>
        <div class="question-detail-tab-content" v-if="activeDetailTab === 'multiplechoice'">
          这里是选择题内容。
        </div>
        <div class="question-detail-tab-content" v-if="activeDetailTab === 'fillblank'">
          这里是填空题内容。
        </div>
        <div class="question-detail-tab-content" v-if="activeDetailTab === 'analysis'">
          这里是深度解析。
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import CountdownTimer from './components/CountdownTimer.vue'; // Import the component if you move it
import CategoryModal from './components/Modals/CategoryModal.vue';
import FilterModal from './components/Modals/FilterModal.vue';

export default {
  name: 'App',
  components: {
    CountdownTimer, // Register the component
    CategoryModal, 
    FilterModal
  },
  data() {
    return {
      questions: [],
      currentIndex: 0,
      loading: true,
      error: false,
      mode: 'sequential',
      randomOrder: [],
      typeColors: {},
      isCategoryModalOpen: false,
      isCategoryModeActive: false,
      selectedCategory: null,
      countdownDuration: 60,
      isFilterModalOpen: false,
      filterButtonColor: '',
      bookmarks: [],
      bookmarkedQuestionIds: [],
      selectedQuestionIds: new Set(),
      selectedQuestions: [],
      isSettingsModalOpen: false,
      appSettings: {
        countdownDuration: 60,
        defaultMode: 'sequential',
        enableCategoryMode: false,
        resumeLastPosition: false
      },
      isQuestionDetailModalOpen: false,
      detailText: '',
      isPlaying: false,
      isJumpToQuestionModalOpen: false,
      jumpToQuestionButtons: [],
      activeDetailTab: 'textarea'
    };
  },
  computed: {
    currentQuestion() {
      let questionList = this.questions;
      if (this.isCategoryModeActive && this.selectedCategory) {
        questionList = this.questions.filter(q => q.question_type === this.selectedCategory);
      }

      if (questionList && questionList.length > 0) {
        const effectiveIndex = this.mode === 'random' ? this.randomOrder.findIndex(index => questionList.indexOf(this.questions[index]) > -1) : this.currentIndex;

        if (this.mode === 'random') {
          const filteredRandomOrder = this.randomOrder.filter(index => questionList.includes(this.questions[index]));
          const currentRandomIndex = filteredRandomOrder[this.currentIndex % filteredRandomOrder.length];
          return this.questions[currentRandomIndex];
        } else {
          return questionList[this.currentIndex % questionList.length];
        }
      } else {
        return { question_id: null, question_text: '', question_type: '' }
      }
    },
    uniqueQuestionTypes() {
      return [...new Set(this.questions.map(q => q.question_type))];
    },
    filteredQuestions() {
      if (this.isCategoryModeActive && this.selectedCategory) {
        return this.questions.filter(q => q.question_type === this.selectedCategory);
      }
      return this.questions;
    },
    isCurrentQuestionSelected() {
      return this.currentQuestion.question_id && this.selectedQuestionIds.has(this.currentQuestion.question_id);
    },
    isCurrentQuestionInSelected() {
      return this.selectedQuestions.some(q => q.question_id === this.currentQuestion.question_id);
    },
    modalClass() {
      return {
        'question-detail-modal': true,
        'fullscreen': this.isQuestionDetailModalOpen
      };
    }
  },
  watch: {
    selectedQuestions: {
      handler(newVal) {
        localStorage.setItem('selectedQuestions', JSON.stringify(newVal));
      },
      deep: true
    },
    currentIndex(newVal) {
      localStorage.setItem('lastViewedIndex', newVal);
    },
    currentQuestion: {
      handler: function (newQuestion, oldQuestion) {
        this.adjustFontSize();
      },
      immediate: true
    },
    'appSettings.defaultMode': function (newVal) {
      this.mode = newVal;
      this.resetCurrentIndex();
    },
    'appSettings.countdownDuration': function (newVal) {
      this.countdownDuration = newVal;
    },
    'appSettings.enableCategoryMode': function (newVal) {
      this.isCategoryModeActive = newVal;
      this.resetCurrentIndex();
    },
    'appSettings.resumeLastPosition': function () {
      this.resetCurrentIndex();
    }
  },
  created() {
    this.loadSettings();
    this.fetchQuestions();
    window.addEventListener('keydown', this.handleKeyDown);
    this.generateFilterButtonColor();
    this.resetCurrentIndex();
    this.loadSelectedQuestions();
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  mounted() {
    this.adjustFontSize();
  },
  methods: {
    loadSelectedQuestions() {
      const savedSelectedQuestions = localStorage.getItem('selectedQuestions');
      if (savedSelectedQuestions) {
        this.selectedQuestions = JSON.parse(savedSelectedQuestions);
        this.selectedQuestions.forEach(question => {
          this.selectedQuestionIds.add(question.question_id);
        });
      }
    },
    getEffectiveIndex() {
      const questionList = this.filteredQuestions;
      if (this.mode === 'random') {
        return this.randomOrder[this.currentIndex]
      } else {
        return this.currentIndex;
      }
    },
    async fetchQuestions() {
      this.loading = true;
      this.error = false;
      try {
        const response = await fetch('http://localhost:5001/api/questions');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.questions = data;
        this.initializeRandomOrder();
        this.generateTypeColors();
      } catch (error) {
        console.error('获取数据失败:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    startFullscreenMode() {
      this.isPlaying = true;
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
      this.resetCurrentIndex();
    },
    prevQuestion() {
      this.currentIndex = (this.currentIndex - 1 + this.filteredQuestions.length) % this.filteredQuestions.length;
    },
    nextQuestion() {
      this.currentIndex = (this.currentIndex + 1) % this.filteredQuestions.length;
    },
    handleKeyDown(event) {
      if (event.key === 'ArrowLeft') {
        this.prevQuestion();
      } else if (event.key === 'ArrowRight') {
        this.nextQuestion();
      } else if (event.code === 'Space') {
        if (this.currentQuestion.question_id) {
          this.toggleSelectCurrentQuestion();
        }
      }
    },
    toggleSelectCurrentQuestion() {
      const questionId = this.currentQuestion.question_id;
      if (!questionId) return;

      if (this.selectedQuestionIds.has(questionId)) {
        this.selectedQuestionIds.delete(questionId);
        this.selectedQuestions = this.selectedQuestions.filter(q => q.question_id !== questionId);
      } else {
        this.selectedQuestionIds.add(questionId);
        this.selectedQuestions.push(this.currentQuestion);
      }
    },
    removeSelectedQuestion(questionId) {
      this.selectedQuestionIds.delete(questionId);
      this.selectedQuestions = this.selectedQuestions.filter(q => q.question_id !== questionId);
    },
    handleImportedQuestions(importedQuestions) {
      // 将导入的题目添加到 selectedQuestions 中
      importedQuestions.forEach(importedQuestion => {
        if (!this.selectedQuestionIds.has(importedQuestion.question_id)) {
          this.selectedQuestions.push(importedQuestion);
          this.selectedQuestionIds.add(importedQuestion.question_id);
        }
      });
    },
    
    removeAllSelectedQuestions() {
      this.selectedQuestionIds.clear();
      this.selectedQuestions = [];
    },
    exportSelectedQuestions() {
      if (this.selectedQuestions.length > 0) {
        const csvRows = [];
        csvRows.push(['题目编号', '题目内容'].join(','));
        this.selectedQuestions.forEach(question => {
          const row = [question.question_id, `"${question.question_text.replace(/"/g, '""')}"`].join(',');
          csvRows.push(row);
        });
        const csvContent = csvRows.join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${year}-${month}-${day} ${hour}-${minute}-${second}`;
        const filename = `selected_questions_${timestamp}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('没有选择任何题目进行导出。');
      }
    },
    addBookmark() {
      const currentQuestionId = this.currentQuestion.question_id;
      if (currentQuestionId) {
        const timestamp = new Date();
        this.bookmarks.push({ question_id: currentQuestionId, timestamp: timestamp });
        if (!this.bookmarkedQuestionIds.includes(currentQuestionId)) {
          this.bookmarkedQuestionIds.push(currentQuestionId);
        }
      }
    },
    resetCurrentIndex() {
      if (this.appSettings.resumeLastPosition) {
        const savedIndex = localStorage.getItem('lastViewedIndex');
        if (savedIndex !== null) {
          this.currentIndex = parseInt(savedIndex, 10);
          return;
        }
      }
      this.currentIndex = 0;
      if (this.mode === 'random') {
        this.initializeRandomOrder();
      }
    },
    initializeRandomOrder() {
      const questionList = this.filteredQuestions;
      this.randomOrder = [...Array(this.questions.length).keys()].filter(index => questionList.includes(this.questions[index]));
      for (let i = this.randomOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.randomOrder[i], this.randomOrder[j]] = [this.randomOrder[j], this.randomOrder[i]];
      }
    },
    generateTypeColors() {
      this.questions.forEach(question => {
        if (!this.typeColors[question.question_type]) {
          this.typeColors[question.question_type] = this.getRandomColor();
        }
      });
    },
    openJumpToQuestionModal() {
      this.isJumpToQuestionModalOpen = true;
      this.generateJumpToQuestionButtons();
    },
    closeJumpToQuestionModal() {
      this.isJumpToQuestionModalOpen = false;
    },
    generateJumpToQuestionButtons() {
      this.jumpToQuestionButtons = this.questions.map((question, index) => ({
        index: index,
        color: this.getRandomColor()
      }));
    },
    jumpToQuestion(index) {
      this.currentIndex = index;
      this.closeJumpToQuestionModal();
    },
    jumpToSelectedQuestion(questionId) {
      if (this.mode === 'sequential') {
        const index = this.questions.findIndex(question => question.question_id === questionId);
        if (index !== -1) {
          this.currentIndex = index;
          this.closeFilterModal();
        }
      } else if (this.mode === 'random') {
        alert('不支持在随机模式下跳转到指定题目。');
      }
    },
    getRandomColor() {
      const r = Math.floor(Math.random() * 200 + 55);
      const g = Math.floor(Math.random() * 200 + 55);
      const b = Math.floor(Math.random() * 200 + 55);
      return `rgb(${r}, ${g}, ${b})`;
    },
    getTypeColor(type) {
      return this.typeColors[type] || 'gray';
    },
    getTypeTextColor(type) {
      const bgColor = this.typeColors[type] || 'gray';
      const rgbValues = bgColor.match(/\d+/g);
      if (!rgbValues) return 'white';
      const luminance = 0.299 * rgbValues[0] + 0.587 * rgbValues[1] + 0.114 * rgbValues[2];
      return luminance < 140 ? 'white' : 'black';
    },
    adjustFontSize() {
      this.$nextTick(() => {
        const contentElement = this.$refs.contentRef;
        const containerElement = document.querySelector('.question-container');
        if (!contentElement || !containerElement) return;

        let fontSize = 3.5;
        contentElement.style.fontSize = `${fontSize}rem`;

        while (contentElement.scrollHeight > containerElement.offsetHeight && fontSize > 1) {
          fontSize -= 0.1;
          contentElement.style.fontSize = `${fontSize}rem`;
        }
      });
        },
    openCategoryModal() {
      this.isCategoryModalOpen = true;
    },
    closeCategoryModal() {
      this.isCategoryModalOpen = false;
    },
    selectCategory(category) {
      this.isCategoryModeActive = true;
      this.selectedCategory = category;
      this.closeCategoryModal();
      this.resetCurrentIndex();
    },
    openFilterModal() {
      this.isFilterModalOpen = true;
      window.removeEventListener('keydown', this.handleKeyDown);
    },
    closeFilterModal() {
      this.isFilterModalOpen = false;
      window.addEventListener('keydown', this.handleKeyDown);
    },
    generateFilterButtonColor() {
      this.filterButtonColor = this.getRandomColor();
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    },
    openSettingsModal() {
      this.isSettingsModalOpen = true;
      window.removeEventListener('keydown', this.handleKeyDown);
    },
    closeSettingsModal() {
      this.isSettingsModalOpen = false;
      window.addEventListener('keydown', this.handleKeyDown);
    },
    saveSettings() {
      localStorage.setItem('appSettings', JSON.stringify(this.appSettings));
      this.closeSettingsModal();
    },
    loadSettings() {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        this.appSettings = JSON.parse(savedSettings);
        this.mode = this.appSettings.defaultMode;
        this.countdownDuration = this.appSettings.countdownDuration;
        this.isCategoryModeActive = this.appSettings.enableCategoryMode;
      }
    },
    restoreDefaultSettings() {
      this.appSettings = {
        countdownDuration: 60,
        defaultMode: 'sequential',
        enableCategoryMode: false,
        resumeLastPosition: false
      };
    },
    openQuestionDetailModal() {
      this.isQuestionDetailModalOpen = true;
      this.detailText = '';
      this.activeDetailTab = 'textarea';
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }

      if (this.$refs.countdownTimer) {
        this.$refs.countdownTimer.stopTimer();
      }
    },
    closeQuestionDetailModal() {
      this.isQuestionDetailModalOpen = false;
      if (this.isPlaying) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.isPlaying = false;
      }
       if (this.$refs.countdownTimer && !this.isQuestionDetailModalOpen) {
        this.$refs.countdownTimer.startTimer();
      }
    },
    selectAllQuestionText() {
      const textarea = document.querySelector('.question-detail-textarea');
      if (textarea) {
        textarea.select();
      }
    },
    saveDetailText() {
      console.log('保存的内容:', this.detailText);
      this.closeQuestionDetailModal();
    },
  }
};
</script>

<style>
/* Your CSS styles from the original HTML file go here */
body {
  padding: 0;
  margin: 0;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 1200px;
  min-height: 96vh;
  position: relative;
  margin: 2vh 2%;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

#app.selected {
  background-color: #cce0ff;
}

#app.highlighted {
  background-color: #fffacd;
}

.header-title {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 1.2rem;
  color: #777;
  display: flex;
  align-items: center;
  z-index: 20;
}

.type-tag-container {
  display: inline-flex;
  align-items: center;
  margin-left: 5px;
}

.top-right-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 20;
}

.filter-button-container {}

.timer-controls {
  display: flex;
  align-items: center;
}

.mode-select {
  display: flex;
  align-items: center;
}

.mode-select > div {
  margin-left: 10px;
}

.question-container {
  text-align: center;
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.content {
  font-size: 3.5rem;
  max-width: 90%;
  white-space: pre-line;
  word-break: keep_all;
  line-height: 1.5;
  overflow-wrap: break-word;
  hyphens: auto;
  transition: font-size 0.3s ease;
  position: relative;
  z-index: 10;
}

.content.bookmarked {
  background-color: #fffacd;
}

.button-container {
  width: 100%;
  padding: 10px;
  position: absolute;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
}

.prev-button,
.next-button {
  padding: 10px 20px;
  font-size: 1rem;
}

.type-tag-button {
  display: inline-flex;
  align-items: center;
  padding: 0.2em 0.5em;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  margin-left: 5px;
  color: white;
  background-color: inherit;
  border: none;
  cursor: pointer;
  z-index: 21;
}

.type-tag {
  display: inline-block;
  padding: 0.2em 0.5em;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
}

.countdown-timer-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.1;
  pointer-events: none;
  z-index: 1;
}

.countdown-timer {
  position: relative;
  width: 620px;
  height: 620px;
  border-radius: 50%;
  border: 5px solid rgba(128, 128, 128, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.countdown-number {
  font-size: 18rem;
  color: #aaa;
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1020;
}

.settings-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 600px;
}

.settings-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.settings-modal-close {
  font-size: 1.5rem;
  color: #aaa;
  cursor: pointer;
}

.settings-group {
  margin-bottom: 15px;
}

.settings-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

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

.question-detail-modal.fullscreen .question-detail-textarea {
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
}

.question-detail-modal.fullscreen .question-detail-close {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  z-index: 10;
}

.jump-to-question-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-height: 80%;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  gap: 10px;
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
  height: 100%;
}
</style>