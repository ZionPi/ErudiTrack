<template>
  <div class="note-tab-content" @keydown.meta.enter="saveNote" @keydown.ctrl.enter="saveNote">
    <textarea
      ref="textarea"
      class="question-detail-textarea"
      v-model="detailText"
      placeholder="在这里写下你的想法、笔记和灵感...可以尝试回答问题，记录思路，或者仅仅是随意的涂鸦。尽情发挥你的创造力吧！"
    ></textarea>
    <div class="save-status-message" v-if="saveStatus">{{ saveStatus }}</div>
    <button ref="saveButton" class="button is-primary save-note-button" @click="saveNote">保存</button>
    <transition name="float-up">
      <div
        v-if="showSaveAnimation"
        class="save-animation"
        :style="{ left: animationX + 'px', top: animationY + 'px' }"
      >
        <i class="el-icon-heart" style="color: red;"></i>
      </div>
    </transition>
  </div>
</template>

<script>
import { showSuccessNotification,showErrorNotification} from '@/utils/helper'; // 导入通知函数
import { createDailyPracticeNote } from '@/services/apiService'; 

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
      saveStatus: '',
      showSaveAnimation: false,
      animationX: 0,
      animationY: 0,
      loading: false,
      userId: 1, 
    };
  },
  computed: {
   
  },
  mounted() {
  },
  methods: {
    async saveNote() {
      if (this.detailText.trim() !== '' && this.questionId !== null) {
        try {
            let created_at = new Date();
            await createDailyPracticeNote(this.userId,this.questionId,this.detailText,created_at.toISOString())
            this.$emit('note-saved');
            this.detailText = '';
            this.triggerSaveAnimation();
            this.showSaveSuccessNotification();
        } catch (error) {
            console.error('加载笔记失败', error);
            this.showSaveFailedNotification();
        } 
      }
    },
   
    showSaveSuccessNotification() {
      showSuccessNotification(this.$notify, '笔记保存成功！');
    },
    showSaveFailedNotification() {
      showErrorNotification(this.$notify,'笔记保存失败！');
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
   
    triggerSaveAnimation() {
      if (this.$refs.saveButton) {
        const rect = this.$refs.saveButton.getBoundingClientRect();
        this.animationX = rect.left + rect.width / 2 - 10;
        this.animationY = rect.top - 20;
        this.showSaveAnimation = true;
        setTimeout(() => {
          this.showSaveAnimation = false;
        }, 800); // 稍微增加动画持续时间
      }
    },
  },
};
</script>

<style scoped>
.note-tab-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
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

/* 动画样式 */
.save-animation {
  position: fixed; /* 使用 fixed 定位，使其相对于视口 */
  font-size: 1.2rem;
  color: red; /* 将颜色修改为红色 */
  pointer-events: none; /* 避免遮挡点击 */
  z-index: 10002;
  /* 调整水平居中 */
  margin-left: -10px; /* 假设爱心宽度大约 20px */
}

/* 上浮动画 */
.float-up-enter-active {
  transition: transform 0.5s ease-out, opacity 0.5s ease-out;
}

.float-up-leave-active {
  transition: transform 0.3s ease-in, opacity 0.3s ease-in;
}

.float-up-enter-from {
  opacity: 0;
  transform: translateY(20px); /* 从下方一点点出现 */
}

.float-up-enter-to {
  opacity: 1;
  transform: translateY(0); /* 移动到原始位置 */
}

.float-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.float-up-leave-to {
  opacity: 0;
  transform: translateY(-30px); /* 向上漂浮一段距离并消失 */
}
</style>