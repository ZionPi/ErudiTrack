<template>
  <div id="home-view">
    <top-right-buttons
      :filter-button-color="filterButtonColor"
      :countdown-duration="countdownDuration"
      :mode="mode"
      :is-category-mode-active="isCategoryModeActive"
      @start-fullscreen="startFullscreenMode"
      @open-settings="openSettingsModal"
      @open-filter="openFilterModal"
      @update-countdown-duration="updateCountdownDuration"
      @update-mode="updateMode"
      @update-category-mode="updateCategoryMode"
    />

    <countdown-timer
      ref="countdownTimer"
      :is-running="!isQuestionDetailModalOpen"
      :initial-seconds="countdownDuration"
      :start-trigger="String(currentQuestion.question_id)"
      @timeup="nextQuestion"
    />

    <question-display
      :currentQuestion="currentQuestion"
      :loading="loading"
      :error="error"
      :bookmarkedQuestionIds="bookmarkedQuestionIds"
      :isCurrentQuestionSelected="isCurrentQuestionSelected"
      :isCurrentQuestionInSelected="isCurrentQuestionInSelected"
      :getTypeColor="getTypeColor"
      :getTypeTextColor="getTypeTextColor"
      @prev-question="prevQuestion"
      @next-question="nextQuestion"
      @open-category-modal="openCategoryModal"
      @open-question-detail-modal="openQuestionDetailModal"
      @open-jump-to-question-modal="openJumpToQuestionModal"
    />

    <category-modal
      :is-open="isCategoryModalOpen"
      :question-types="uniqueQuestionTypes"
      :type-color="getTypeColor"
      :type-text-color="getTypeTextColor"
      @close="closeCategoryModal"
      @select="selectCategory"
    />

     <question-jump-modal
      :is-open="isJumpToQuestionModalOpen"
      :jumpToButtons="jumpToQuestionButtons"
      :getTypeTextColor="getTypeTextColor"
      @close="closeJumpToQuestionModal"
      @jump="jumpToQuestion"
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
    <settings-modal
      :is-open="isSettingsModalOpen"
      :initial-settings="appSettings"
      @close="closeSettingsModal"
      @save="handleSaveSettings"
    />

    <!-- Question Detail Modal -->
    <question-detail-modal
      :is-open="isQuestionDetailModalOpen"
      :question="currentQuestion"
      :is-full-screen="isQuestionDetailFullScreen"
      @close="closeQuestionDetailModal"
      @save-detail="handleSaveDetail"
      @update-question-answer="handleUpdateQuestionPrompt"
    />
  </div>
</template>
<script>
import CountdownTimer from '../components/CountdownTimer.vue';
import CategoryModal from '../components/Modals/CategoryModal.vue';
import FilterModal from '../components/Modals/FilterModal.vue';
import SettingsModal from '../components/Modals/SettingsModal.vue';
import QuestionDetailModal from '../components/Modals/QuestionDetailModal.vue';
import QuestionDisplay from '../components/QuestionDisplay.vue';
import TopRightButtons from '../components/TopRightButtons.vue'; 
import QuestionJumpModal from '../components/Modals/QuestionJumpModal.vue'; 

export default {
  name: 'HomeView', // Update the component name
  components: {
    CountdownTimer,
    CategoryModal,
    FilterModal,
    SettingsModal,
    QuestionDetailModal,
    QuestionDisplay,
    TopRightButtons,
    QuestionJumpModal
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
        resumeLastPosition: false,
      },
      isQuestionDetailModalOpen: false,
      isQuestionDetailFullScreen: false,
      isJumpToQuestionModalOpen: false,
      jumpToQuestionButtons: [],
    };
  },
  computed: {
    currentQuestion() {
      let questionList = this.questions;
      if (this.isCategoryModeActive && this.selectedCategory) {
        questionList = this.questions.filter(
          (q) => q.question_type === this.selectedCategory
        );
      }

      if (questionList && questionList.length > 0) {
        const effectiveIndex =
          this.mode === 'random'
            ? this.randomOrder.findIndex((index) =>
                questionList.indexOf(this.questions[index]) > -1
              )
            : this.currentIndex;

        if (this.mode === 'random') {
          const filteredRandomOrder = this.randomOrder.filter((index) =>
            questionList.includes(this.questions[index])
          );
          const currentRandomIndex =
            filteredRandomOrder[this.currentIndex % filteredRandomOrder.length];
          return this.questions[currentRandomIndex];
        } else {
          return questionList[this.currentIndex % questionList.length];
        }
      } else {
        return { question_id: null, question_text: '', question_type: '',question_prompt:''};
      }
    },
    uniqueQuestionTypes() {
      return [...new Set(this.questions.map((q) => q.question_type))];
    },
    filteredQuestions() {
      if (this.isCategoryModeActive && this.selectedCategory) {
        return this.questions.filter(
          (q) => q.question_type === this.selectedCategory
        );
      }
      return this.questions;
    },
    isCurrentQuestionSelected() {
      return (
        this.currentQuestion.question_id &&
        this.selectedQuestionIds.has(this.currentQuestion.question_id)
      );
    },
    isCurrentQuestionInSelected() {
      return this.selectedQuestions.some(
        (q) => q.question_id === this.currentQuestion.question_id
      );
    },
    modalClass() {
      return {
        'question-detail-modal': true,
        fullscreen: this.isQuestionDetailModalOpen,
      };
    },
  },
  watch: {
    selectedQuestions: {
      handler(newVal) {
        localStorage.setItem('selectedQuestions', JSON.stringify(newVal));
      },
      deep: true,
    },
    currentIndex(newVal) {
      localStorage.setItem('lastViewedIndex', newVal);
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
    },
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
  methods: {
    loadSelectedQuestions() {
      const savedSelectedQuestions = localStorage.getItem('selectedQuestions');
      if (savedSelectedQuestions) {
        this.selectedQuestions = JSON.parse(savedSelectedQuestions);
        this.selectedQuestions.forEach((question) => {
          this.selectedQuestionIds.add(question.question_id);
        });
      }
    },
    getEffectiveIndex() {
      const questionList = this.filteredQuestions;
      if (this.mode === 'random') {
        return this.randomOrder[this.currentIndex];
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
      this.isQuestionDetailFullScreen = true;
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
      this.currentIndex =
        (this.currentIndex - 1 + this.filteredQuestions.length) %
        this.filteredQuestions.length;
    },
    nextQuestion() {
      this.currentIndex =
        (this.currentIndex + 1) % this.filteredQuestions.length;
    },
    handleKeyDown(event) {
      if (event.key === 'ArrowLeft') {
        this.prevQuestion();
      } else if (event.key === 'ArrowRight') {
        this.nextQuestion();
      } else if (event.code === 'Space' && !this.isQuestionDetailModalOpen) {
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
        this.selectedQuestions = this.selectedQuestions.filter(
          (q) => q.question_id !== questionId
        );
      } else {
        this.selectedQuestionIds.add(questionId);
        this.selectedQuestions.push(this.currentQuestion);
      }
    },
    removeSelectedQuestion(questionId) {
      this.selectedQuestionIds.delete(questionId);
      this.selectedQuestions = this.selectedQuestions.filter(
        (q) => q.question_id !== questionId
      );
    },
    handleImportedQuestions(importedQuestions) {
      // 将导入的题目添加到 selectedQuestions 中
      importedQuestions.forEach((importedQuestion) => {
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
        this.selectedQuestions.forEach((question) => {
          const row = [
            question.question_id,
            `"${question.question_text.replace(/"/g, '""')}"`,
          ].join(',');
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
        this.bookmarks.push({
          question_id: currentQuestionId,
          timestamp: timestamp,
        });
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
      this.randomOrder = [...Array(this.questions.length).keys()].filter(
        (index) => questionList.includes(this.questions[index])
      );
      for (let i = this.randomOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.randomOrder[i], this.randomOrder[j]] = [
          this.randomOrder[j],
          this.randomOrder[i],
        ];
      }
    },
    generateTypeColors() {
      this.questions.forEach((question) => {
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
        color: this.getRandomColor(),
      }));
    },
    jumpToQuestion(index) {
      this.currentIndex = index;
      this.closeJumpToQuestionModal();
    },
    jumpToSelectedQuestion(questionId) {
      if (this.mode === 'sequential') {
        const index = this.questions.findIndex(
          (question) => question.question_id === questionId
        );
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
      const luminance =
        0.299 * rgbValues[0] + 0.587 * rgbValues[1] + 0.114 * rgbValues[2];
      return luminance < 140 ? 'white' : 'black';
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

    handleSaveSettings(newSettings) {
      this.appSettings = { ...newSettings };
      localStorage.setItem('appSettings', JSON.stringify(this.appSettings));
      this.closeSettingsModal();
      // 根据新的设置更新 App.vue 的状态
      this.mode = this.appSettings.defaultMode;
      this.countdownDuration = this.appSettings.countdownDuration;
      this.isCategoryModeActive = this.appSettings.enableCategoryMode;
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

    openQuestionDetailModal() {
      this.isQuestionDetailModalOpen = true;
      this.isQuestionDetailFullScreen = true;
      // if (document.documentElement.requestFullscreen) {
      //   document.documentElement.requestFullscreen();
      // } else if (document.documentElement.mozRequestFullScreen) {
      //   document.documentElement.mozRequestFullScreen();
      // } else if (document.documentElement.webkitRequestFullscreen) {
      //   document.documentElement.webkitRequestFullscreen();
      // } else if (document.documentElement.msRequestFullscreen) {
      //   document.documentElement.msRequestFullscreen();
      // }

      if (this.$refs.countdownTimer) {
        this.$refs.countdownTimer.stopTimer();
      }
    },

    closeQuestionDetailModal() {
      this.isQuestionDetailModalOpen = false;
      this.isQuestionDetailFullScreen = false;

      if (this.isQuestionDetailFullScreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.isQuestionDetailFullScreen = false;
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

    handleSaveDetail(detailText) {
      console.log('保存的内容:', detailText);
      this.closeQuestionDetailModal();
    },

   handleUpdateQuestionPrompt(newPrompt) {
        // Find the index of the current question in the questions array
        const currentQuestionId = this.currentQuestion.question_id;
        const questionIndex = this.questions.findIndex(q => q.question_id === currentQuestionId);

        if (questionIndex !== -1) {
          // Update the question_prompt of the found question
          this.questions = this.questions.map((question, index) =>
            index === questionIndex ? { ...question, question_prompt: newPrompt } : question
          );
        }
    },

    updateCountdownDuration(value) {
      this.countdownDuration = value;
    },
    updateMode(value) {
      this.mode = value;
      this.resetCurrentIndex();
    },
    updateCategoryMode(value) {
      this.isCategoryModeActive = value;
      this.resetCurrentIndex();
    },
  },
};
</script>

<style scoped>
/* Add scoped to HomeView styles */

body {
  padding: 0;
  margin: 0;
  background-color: #f0f0f0;
  display: flex; /* Enable flexbox on the body */
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  min-height: 100vh; /* Ensure the body takes up the full viewport height */
}

#home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  /* Apply the width and max-width from the previous #app style */
  width: 90%;
  min-width:1200px;
  max-width: 1200px;
  min-height: 96vh;
  position: relative;
  margin: 2vh 2%;
  transition: background-color 0.3s ease;
  cursor: default; /* Changed from pointer to default as the interaction is within the component */
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

.filter-button-container {
}

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

     
</style>