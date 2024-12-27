<template>
  <div :class="modalClass" v-if="isOpen">
    <div class="question-detail-modal-content">
      <span class="question-detail-close" @click="close">×</span>
      <h2 class="question-detail-header">{{ question.question_text }}</h2>
      <div class="question-detail-actions">
        <button class="button" @click="selectAllText">全选</button>
        <button class="button is-primary" @click="saveDetail">保存</button>
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

      <div class="question-detail-tab-content" v-if="activeTab === 'textarea'">
        <textarea class="question-detail-textarea" v-model="detailText"
                  placeholder="在这里写下你的想法、笔记和灵感...可以尝试回答问题，记录思路，或者仅仅是随意的涂鸦。尽情发挥你的创造力吧！"></textarea>
      </div>
      <div class="question-detail-tab-content" v-if="activeTab === 'hints'">
        这里是提示内容。
      </div>
      <div class="question-detail-tab-content" v-if="activeTab === 'history'">
        这里是历史解答。
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
      default: () => ({ question_text: '' })
    },
    isFullScreen: Boolean
  },
  data() {
    return {
      detailText: '',
      activeTab: 'textarea'
    };
  },
  computed: {
    modalClass() {
      return {
        'question-detail-modal': true,
        'fullscreen': this.isFullScreen
      };
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
    saveDetail() {
      this.$emit('save-detail', this.detailText);
      this.close();
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