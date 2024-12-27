<template>
  <div class="question-display" :class="{ selected: isCurrentQuestionSelected, highlighted: isCurrentQuestionInSelected }">
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

    <div class="question-container">
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
  </div>
</template>

<script>
export default {
  name: 'QuestionDisplay',
  props: {
    currentQuestion: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    },
    bookmarkedQuestionIds: {
      type: Array,
      default: () => []
    },
    isCurrentQuestionSelected: {
      type: Boolean,
      default: false
    },
    isCurrentQuestionInSelected: {
      type: Boolean,
      default: false
    },
    getTypeColor: {
      type: Function,
      required: true
    },
    getTypeTextColor: {
      type: Function,
      required: true
    },
    isQuestionDetailModalOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['prev-question', 'next-question', 'open-category-modal', 'open-question-detail-modal', 'open-jump-to-question-modal'],
  methods: {
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
    prevQuestion() {
      this.$emit('prev-question');
    },
    nextQuestion() {
      this.$emit('next-question');
    },
    openCategoryModal() {
      this.$emit('open-category-modal');
    },
    openQuestionDetailModal() {
      this.$emit('open-question-detail-modal');
    },
    openJumpToQuestionModal() {
      this.$emit('open-jump-to-question-modal');
    } 
  },
  mounted() {
    this.adjustFontSize();
  },
  watch: {
    currentQuestion: {
      handler: function () {
        this.adjustFontSize();
      },
      immediate: true
    }
  }
};
</script>

<style>
.question-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex: 1;
  position: relative;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.question-display.selected {
  background-color: #cce0ff;
}

.question-display.highlighted {
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
</style>