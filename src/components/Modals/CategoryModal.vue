<template>
  <div class="category-modal" v-if="isOpen">
    <div class="category-modal-content">
      <span class="category-modal-close" @click="$emit('close')">×</span>
      <button v-for="type in questionTypes" :key="type" class="category-modal-button"
              :style="{ backgroundColor: typeColor(type), color: typeTextColor(type) }"
              @click="$emit('select', type)">
        #{{ type }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryModal',
  props: {
    isOpen: Boolean,
    questionTypes: Array,
    typeColor: Function,
    typeTextColor: Function,
  },
};
</script>

<style scoped>
/* 如果需要，可以在这里添加组件特定的样式 */
.category-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.category-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-height: 80%;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 10px;
}

.category-modal-button {
  padding: 0.5em 1em;
  border-radius: 4px;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
}

.category-modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  color: #aaa;
  cursor: pointer;
}
</style>