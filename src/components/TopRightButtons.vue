<template>
  <div class="top-right-controls">
    <button class="button is-small" @click.stop="$emit('start-fullscreen')">
      <span class="icon">
        <i class="fas fa-play"></i>
      </span>
    </button>
    <button class="button is-small" @click.stop="$emit('open-settings')">
      <span class="icon">
        <i class="fas fa-cog"></i>
      </span>
    </button>
    <div class="filter-button-container">
      <button class="button is-small" :style="{ backgroundColor: filterButtonColor }"
              @click.stop="$emit('open-filter')">
        <span class="icon">
          <i class="fas fa-list"></i>
        </span>
      </button>
    </div>
    <div class="timer-controls">
      <label for="countdown-duration">倒计时:</label>
      <input
        id="countdown-duration"
        type="number"
        :value="countdownDuration"
        min="1"
        class="input is-small"
        style="width: 60px;"
        @input="$emit('update-countdown-duration', $event.target.valueAsNumber)"
      >
      <span style="margin-left: 5px; color: #777; font-size: 0.9rem;">秒</span>
    </div>
    <div class="mode-select">
      <div class="select is-small">
        <select :value="mode" @change="$emit('update-mode', $event.target.value)">
          <option value="sequential">顺序模式</option>
          <option value="random">随机模式</option>
        </select>
      </div>
      <div class="control">
        <label class="checkbox">
          <input type="checkbox" :checked="isCategoryModeActive" @change="$emit('update-category-mode', $event.target.checked)">
          类别模式
        </label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopRightButtons',
  props: {
    filterButtonColor: {
      type: String,
      required: true
    },
    countdownDuration: {
      type: Number,
      default: 60
    },
    mode: {
      type: String,
      default: 'sequential'
    },
    isCategoryModeActive: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'start-fullscreen',
    'open-settings',
    'open-filter',
    'update-countdown-duration',
    'update-mode',
    'update-category-mode'
  ]
};
</script>

<style scoped>
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
</style>