<template>
  <div class="list-manager-page">
    <div class="fixed-header">
      <el-button
        icon="el-icon-arrow-left"
        circle
        class="back-button"
        @click="goBack"
      ></el-button>
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
          <el-button
            type="danger"
            @click="deleteSelectedLists"
            :disabled="selectedLists.length === 0"
          >
            Delete Selected
          </el-button>
        </div>
      </div>
    </div>

    <div class="scrollable-content" ref="scrollContent">
      <div class="grid-container">
        <div
          v-for="list in filteredLists"
          :key="list.collection_id"
          class="grid-cell"
          :class="{
            'edit-mode': isEditing,
            selected: isEditing && selectedLists.includes(list.collection_id),
          }"
          @click="
            !isEditing ? showInnerList(list.collection_id) : toggleSelect(list.collection_id)
          "
        >
          <div class="cell-content">
            <el-checkbox
              v-if="isEditing"
              v-model="selectedLists"
              :label="list.collection_id"
              style="position: absolute; top: 10px; left: 10px; z-index: 1;"
              @click.stop
            ></el-checkbox>
            <span>{{ list.collection_name }}</span>
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


    <el-dialog :visible.sync="addDialogVisible" title="Add New List">
      <el-form :model="newCollection" label-width="100px">
        <el-form-item label="List Name">
          <el-input v-model="newCollection.collection_name" placeholder="List Name"></el-input>
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="newCollection.description"
            type="textarea"
            placeholder="List Description"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveNewList">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAllCollections,
  createCollection,
  deleteCollection,
  getCollectionItemsByCollection,
} from '@/services/apiService'; // 确保路径正确

export default {
  name: 'ListManager',
  data() {
    return {
      collections: [],
      isEditing: false,
      selectedLists: [],
      addDialogVisible: false,
      newCollection: {
        user_id: this.userId, // 初始值
        collection_name: '',
        description: '',
      },
      searchQuery: '',
      showScrollButtons: false,
      userId: 1, // Replace with your actual user ID logic
    };
  },
  computed: {
    filteredLists() {
      const query = this.searchQuery.toLowerCase();
      return this.collections.filter((list) =>
        list.collection_name.toLowerCase().includes(query)
      );
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
    this.fetchCollections();
    this.checkScrollOverflow();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async fetchCollections() {
      try {
        const data = await getAllCollections();
        this.collections = data;
      } catch (error) {
        this.$message.error('Failed to fetch lists.');
      }
    },
    addList() {
      this.newCollection = {
        user_id: this.userId, // 确保每次打开都设置正确的 userId
        collection_name: this.formatTimestamp(new Date()),
        description: '',
      };
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
    async saveNewList() {
      if (this.newCollection.collection_name.trim() !== '') {
        try {
          await createCollection(this.newCollection);
          this.$message.success('List created successfully.');
          this.fetchCollections();
          this.addDialogVisible = false;
        } catch (error) {
          this.$message.error('Failed to create list.');
        }
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
    async showInnerList(collectionId) {
      this.$router.push({ name: 'ListView', params: { id: collectionId } });
    },
    selectAllLists() {
      this.selectedLists = this.collections.map((list) => list.collection_id);
    },
    unselectAllLists() {
      this.selectedLists = [];
    },
    async deleteSelectedLists() {
      if (this.selectedLists.length > 0) {
        try {
          for (const id of this.selectedLists) {
            await deleteCollection(id);
          }
          this.$message.success('Selected lists deleted successfully.');
          this.fetchCollections();
          this.selectedLists = [];
          this.isEditing = false;
        } catch (error) {
          this.$message.error('Failed to delete selected lists.');
        }
      }
    },
    toggleSelect(collectionId) {
      if (this.isEditing) {
        if (this.selectedLists.includes(collectionId)) {
          this.selectedLists = this.selectedLists.filter((id) => id !== collectionId);
        } else {
          this.selectedLists.push(collectionId);
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

.back-button {
  position: absolute;
  top: 10px;
  left: 20px;
  z-index: 11; /* Ensure it's above other header elements */
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