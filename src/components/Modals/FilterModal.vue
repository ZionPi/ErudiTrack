<template>
  <div class="filter-modal" v-if="isOpen">
    <div class="filter-modal-content">
      <div class="filter-modal-header">
        <span class="filter-modal-close" @click="$emit('close')">×</span>
      </div>
      <div class="filter-search-container">
        <div class="control has-icons-left">
          <input class="input is-small" type="text" placeholder="搜索题目...">
          <span class="icon is-small is-left">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
      <div class="filter-actions">
        <button class="button is-info is-fullwidth" @click="triggerImport">导入</button>
        <input type="file" id="importFile" ref="importFile"  accept=".csv" style="display: none;" @change="handleFileChange">
        <button class="button is-danger is-fullwidth" @click="$emit('remove-all-selected')"
                :disabled="selectedQuestions.length === 0">全部删除</button>
        <button class="button is-primary is-fullwidth" @click="$emit('export')"
                :disabled="selectedQuestions.length === 0">导出</button>
      </div>
      <ul class="bookmarks-list" v-if="bookmarks.length > 0">
        <li v-for="bookmark in bookmarks" :key="bookmark.question_id + '-' + bookmark.timestamp">
          题目 {{ bookmark.question_id }} - {{ formatTime(bookmark.timestamp) }}
        </li>
      </ul>

      <!-- Selected Questions List (inside Filter Modal) -->
      <div class="selected-questions-list" v-if="selectedQuestions.length > 0">
        <ul>
          <li v-for="selectedQuestion in selectedQuestions" :key="selectedQuestion.question_id"
              @click="$emit('jump-to-selected', selectedQuestion.question_id)" style="cursor: pointer;">
            题目 {{ selectedQuestion.question_id }}
            <span class="content-preview">{{ selectedQuestion.question_text }}</span>
            <button @click.stop="$emit('remove-selected', selectedQuestion.question_id)">×</button>
          </li>
        </ul>
      </div>
      <p v-else-if="bookmarks.length === 0 && selectedQuestions.length === 0">没有添加任何书签或选择任何题目。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterModal',
  props: {
    isOpen: Boolean,
    bookmarks: Array,
    selectedQuestions: Array,
  },
  emits: ['close', 'jump-to-selected', 'remove-selected', 'import', 'export', 'remove-all-selected'],
  methods: {
    triggerImport() {
        this.$refs.importFile.click();
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.parseCsvFile(file);
      }
    },
    parseCsvFile(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvData = event.target.result;
        this.processCsvData(csvData);
      };
      reader.readAsText(file);
    },
    processCsvData(csvData) {
      const lines = csvData.trim().split('\r\n');
      if (lines.length <= 1) {
        alert('CSV 文件内容为空或格式不正确。');
        return;
      }

      const headers = lines[0].split(',');
      if (headers[0] !== '题目编号' || headers[1] !== '题目内容') {
        alert('CSV 文件头部格式不正确，应包含 "题目编号" 和 "题目内容" 列。');
        return;
      }

      const importedQuestions = [];
      for (let i = 1; i < lines.length; i++) {
        const [question_id, question_text] = lines[i].split(',').map(item => item.trim().replace(/^"(.*)"$/, '$1'));
        const id = parseInt(question_id, 10);
        if (!isNaN(id) && question_text) {
          importedQuestions.push({ question_id: id, question_text });
        }
      }
      this.$emit('import', importedQuestions);
    },
  },
};
</script>

<style scoped>
/* 可以将 Filter Modal 相关的 CSS 样式移动到这里 */
.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1010;
}

.filter-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
}

.filter-modal-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
}

.filter-modal-close {
  font-size: 1.5rem;
  color: #aaa;
  cursor: pointer;
}

.bookmarks-list {
  margin-top: 15px;
}

.bookmarks-list li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

.selected-questions-list {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.selected-questions-list ul {
  list-style: none;
  padding: 0;
}

.selected-questions-list li {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-questions-list li:last-child {
  border-bottom: none;
}

.selected-questions-list li .content-preview {
  flex-grow: 1;
  margin-left: 10px;
  font-size: 0.9rem;
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-questions-list li button {
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 1rem;
}

.filter-search-container {
  margin-bottom: 10px;
}

.filter-search-container .control {
  width: 100%;
}

.filter-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
</style>