<template>
  <div class="list-manager-page">
    <div class="fixed-header">
      <h1>Manage Lists</h1>

      <div class="search-bar">
        <el-input
          placeholder="Search lists..."
          v-model="searchQuery"
          clearable
        ></el-input>
      </div>

      <div class="actions">
        <el-button type="primary" @click="addList">Add List</el-button>
        <el-button type="warning" @click="toggleEditMode">
          {{ isEditing ? 'Cancel Edit' : 'Edit' }}
        </el-button>
        <div v-if="isEditing">
          <el-button @click="selectAllLists">Select All</el-button>
          <el-button @click="unselectAllLists">Unselect All</el-button>
          <el-button type="danger" @click="deleteSelectedLists" :disabled="selectedLists.length === 0">
            Delete Selected
          </el-button>
        </div>
      </div>
    </div>

    <div class="scrollable-content" ref="scrollContent">
      <div class="grid-container">
        <div
          v-for="list in filteredLists"
          :key="list.id"
          class="grid-cell"
          :class="{ 'edit-mode': isEditing, 'selected': isEditing && selectedLists.includes(list.id) }"
          @click="!isEditing ? showInnerList(list) : toggleSelect(list.id)"
        >
          <div class="cell-content">
            <el-checkbox
              v-if="isEditing"
              v-model="selectedLists"
              :label="list.id"
              style="position: absolute; top: 10px; left: 10px; z-index: 1;"
              @click.stop
            ></el-checkbox>
            <span>{{ list.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="scroll-buttons" v-if="showScrollButtons">
      <el-button
        @click="scrollToTop"
        icon="el-icon-arrow-up"
        class="scroll-button"
      ></el-button>
      <el-button
        @click="scrollToBottom"
        icon="el-icon-arrow-down"
        class="scroll-button"
      ></el-button>
    </div>

    <el-dialog :visible.sync="dialogVisible" title="List Details">
      <div v-if="selectedList">
        <h2>{{ selectedList.name }}</h2>
        <ul>
          <li v-for="(item, index) in selectedList.items" :key="index">{{ item }}</li>
        </ul>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Close</el-button>
      </span>
    </el-dialog>

    <el-dialog :visible.sync="addDialogVisible" title="Add New List">
      <el-input v-model="newListName" placeholder="List Name"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveNewList">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'ListManager',
  data() {
    return {
      lists: [
      ],
      isEditing: false,
      selectedLists: [],
      dialogVisible: false,
      selectedList: null,
      addDialogVisible: false,
      newListName: '',
      searchQuery: '',
      showScrollButtons: false,
    };
  },
  computed: {
    filteredLists() {
      const query = this.searchQuery.toLowerCase();
      return this.lists.filter(list => list.name.toLowerCase().includes(query));
    },
  },
  watch: {
    filteredLists: {
      immediate: true,
      handler() {
        this.$nextTick(this.checkScrollOverflow);
      },
    },
  },
  mounted() {
    this.checkScrollOverflow();
  },
  methods: {
    addList() {
      this.newListName = this.formatTimestamp(new Date());
      this.addDialogVisible = true;
    },
    formatTimestamp(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    saveNewList() {
      if (this.newListName.trim() !== '') {
        this.lists.push({ id: uuidv4(), name: this.newListName, items: [] });
        this.newListName = '';
        this.addDialogVisible = false;
      } else {
        this.$message.warning('List name cannot be empty.');
      }
    },
    toggleEditMode() {
      this.isEditing = !this.isEditing;
      if (!this.isEditing) {
        this.selectedLists = [];
      }
    },
    showInnerList(list) {
      this.selectedList = list;
      this.dialogVisible = true;
    },
    selectAllLists() {
      this.selectedLists = this.lists.map(list => list.id);
    },
    unselectAllLists() {
      this.selectedLists = [];
    },
    deleteSelectedLists() {
      if (this.selectedLists.length > 0) {
        this.lists = this.lists.filter(list => !this.selectedLists.includes(list.id));
        this.selectedLists = [];
        this.isEditing = false;
        this.$message.success('Selected lists deleted successfully.');
      }
    },
    toggleSelect(listId) {
      if (this.isEditing) {
        if (this.selectedLists.includes(listId)) {
          this.selectedLists = this.selectedLists.filter(id => id !== listId);
        } else {
          this.selectedLists.push(listId);
        }
      }
    },
    scrollToTop() {
      this.$refs.scrollContent.scrollTop = 0;
    },
    scrollToBottom() {
      this.$refs.scrollContent.scrollTop = this.$refs.scrollContent.scrollHeight;
    },
    checkScrollOverflow() {
      if (this.$refs.scrollContent) {
        this.showScrollButtons =
          this.$refs.scrollContent.scrollHeight > this.$refs.scrollContent.clientHeight;
      }
    },
  },
};
</script>

<style scoped>
.list-manager-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.fixed-header {
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
  padding-top: 20px; /* 添加顶部内边距 */
  position: relative; /* Keep position relative for the scroll buttons */
}

h1 {
  text-align: center;
  margin-bottom: 10px;
  margin-top: 0;
}

.search-bar {
  margin-bottom: 10px;
}

.actions {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, 150px);
  column-gap: 15px;
  row-gap: 8px;
  justify-content: flex-start;
}

@media (min-width: 601px) {
  .grid-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

.grid-cell {
  background-color: #e0e0e0;
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s ease;
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-cell:hover {
  background-color: #d0d0d0;
}

.cell-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-cell.edit-mode {
  background-color: #f8f8f8;
  border: 1px solid #ccc;
}

.grid-cell.edit-mode.selected {
  background-color: #ffe0b2;
}

.scroll-buttons {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: flex;
  flex-direction: row; /* 改为横向排列 */
  gap: 10px;
  z-index: 2;
}

.scroll-button {
  opacity: 0.7;
  padding: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  margin: 0; /* 移除按钮可能存在的默认 margin */
}
</style>