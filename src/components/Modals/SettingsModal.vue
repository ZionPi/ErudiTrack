<template>
  <div class="settings-modal" v-if="isOpen">
    <div class="settings-modal-content">
      <div class="settings-modal-header">
        <h2 class="title is-4">设置</h2>
        <span class="settings-modal-close" @click="close">×</span>
      </div>
      <div class="settings-group">
        <label for="initial-countdown">初始倒计时时长 (秒)</label>
        <input id="initial-countdown" type="number" class="input"
               v-model.number="settings.countdownDuration">
      </div>
      <div class="settings-group">
        <label for="default-mode">默认模式</label>
        <div class="select is-fullwidth">
          <select id="default-mode" v-model="settings.defaultMode">
            <option value="sequential">顺序模式</option>
            <option value="random">随机模式</option>
          </select>
        </div>
      </div>
      <div class="settings-group">
        <label class="checkbox">
          <input type="checkbox" v-model="settings.enableCategoryMode">
          启用类别模式
        </label>
      </div>

      <!-- 新增的复选框 -->
      <div class="settings-group">
        <label class="checkbox">
          <input type="checkbox" v-model="settings.resumeLastPosition">
          从上次停止的位置开始浏览
        </label>
      </div>

      <div class="settings-actions">
        <button class="button is-success" @click="save">保存</button>
        <button class="button" @click="restoreDefault">恢复默认</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsModal',
  props: {
    isOpen: Boolean,
    initialSettings: {
      type: Object,
      default: () => ({
        countdownDuration: 60,
        defaultMode: 'sequential',
        enableCategoryMode: false,
        resumeLastPosition: false
      })
    }
  },
  data() {
    return {
      settings: { ...this.initialSettings }
    };
  },
  watch: {
    initialSettings: {
      handler(newVal) {
        this.settings = { ...newVal };
      },
      deep: true
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    save() {
      this.$emit('save', this.settings);
    },
    restoreDefault() {
      this.settings = {
        countdownDuration: 60,
        defaultMode: 'sequential',
        enableCategoryMode: false,
        resumeLastPosition: false
      };
    }
  }
};
</script>

<style scoped>
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
</style>