<template>
  <div class="list-view-page">
    <div class="fixed-header">
      <el-button
        icon="el-icon-arrow-left"
        circle
        class="back-button"
        @click="$router.go(-1)"
      ></el-button>
      <h1>{{ collectionName }}</h1>
      <div class="actions">
        <el-button type="primary" @click="addItem">Add Item</el-button>
      </div>
    </div>

    <div class="scrollable-content" ref="scrollContent">
      <p v-if="collectionDescription" class="collection-description">
        {{ collectionDescription }}
      </p>

      <ul v-if="collectionItems.length > 0" class="item-list">
        <li v-for="item in collectionItems" :key="item.collection_item_id" class="list-item">
          <div class="item-content">
            <span class="item-type">{{ item.item_type }}</span>
            <span class="item-id">#{{ item.item_id }}</span>
            <span class="item-source">({{ item.item_data_source }})</span>
          </div>
        </li>
      </ul>
      <p v-else class="no-items">This list has no items.</p>
    </div>

    <el-dialog :visible.sync="addItemDialogVisible" title="Add New Item">
      <el-form :model="newItem" label-width="120px">
        <el-form-item label="Item Type">
          <el-input v-model="newItem.item_type" placeholder="Item Type"></el-input>
        </el-form-item>
        <el-form-item label="Item ID">
          <el-input v-model="newItem.item_id" placeholder="Item ID"></el-input>
        </el-form-item>
        <el-form-item label="Data Source">
          <el-select v-model="newItem.item_data_source" placeholder="Select Data Source">
            <el-option
              v-for="source in dataSourceTypes"
              :key="source"
              :label="source"
              :value="source"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Item Order">
          <el-input-number v-model.number="newItem.item_order" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="Notes">
          <el-input v-model="newItem.notes" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addItemDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveNewItem">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCollectionItemsByCollection,
  getAllCollections,
  createCollectionItem,
  getAllDataSourceTypes,
} from '@/services/apiService'; // Import necessary API functions

export default {
  name: 'ListView',
  data() {
    return {
      collectionId: null,
      collectionName: '',
      collectionDescription: '',
      collectionItems: [],
      addItemDialogVisible: false,
      newItem: {
        collection_id: null,
        item_type: '',
        item_id: '',
        item_data_source: '',
        item_order: 1, // Default value
        notes: '',
      },
      dataSourceTypes: [], // Placeholder, replace with fetched data
    };
  },
  mounted() {
    this.collectionId = this.$route.params.id;
    this.newItem.collection_id = this.collectionId;
    this.fetchCollectionDetails();
    this.fetchCollectionItems();
    this.fetchDataSourceTypes(); // Fetch data source types on mount
  },
  methods: {
    async fetchCollectionDetails() {
      try {
        const data = await getAllCollections();
        const collection = data.find((col) => col.collection_id == this.collectionId);
        if (collection) {
          this.collectionName = collection.collection_name;
          this.collectionDescription = collection.description;
        } else {
          this.$message.error('Collection not found.');
          this.$router.push('/list-manager');
        }
      } catch (error) {
        this.$message.error('Failed to fetch collection details.');
      }
    },
    async fetchCollectionItems() {
      try {
        const data = await getCollectionItemsByCollection(this.collectionId);
        this.collectionItems = data;
      } catch (error) {
        this.$message.error('Failed to fetch list items.');
      }
    },
    async fetchDataSourceTypes() {
      try {
        const data = await getAllDataSourceTypes();
        this.dataSourceTypes = data.map(item => item.data_source_type); // Adjust based on your API response
      } catch (error) {
        this.$message.error('Failed to fetch data source types.');
      }
    },
    addItem() {
      this.newItem = {
        collection_id: this.collectionId,
        item_type: '',
        item_id: '',
        item_data_source: '',
        item_order: 1,
        notes: '',
      };
      this.addItemDialogVisible = true;
    },
    async saveNewItem() {
      if (
        this.newItem.item_type.trim() !== '' &&
        this.newItem.item_id.trim() !== '' &&
        this.newItem.item_data_source.trim() !== ''
      ) {
        try {
          await createCollectionItem(this.newItem);
          this.$message.success('Item added successfully.');
          this.addItemDialogVisible = false;
          this.fetchCollectionItems();
        } catch (error) {
          this.$message.error('Failed to add item.');
        }
      } else {
        this.$message.warning('Item Type, Item ID, and Data Source cannot be empty.');
      }
    },
  },
};
</script>

<style scoped>
.list-view-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.back-button {
  position: absolute;
  top: 10px;
  left: 20px;
  z-index: 11;
}

.fixed-header {
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.fixed-header h1 {
  margin: 0;
}

.fixed-header .actions {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.collection-description {
  margin-bottom: 15px;
  color: #555;
}

.item-list {
  list-style: none;
  padding: 0;
  width: 100%;
}

.list-item {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.list-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.item-content {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.item-type {
  font-weight: bold;
  margin-right: 10px;
}

.item-id {
  color: #337ecc;
  margin-right: 10px;
}

.item-source {
  color: #777;
  font-size: 14px;
}

.no-items {
  font-style: italic;
  color: #888;
  text-align: center;
}
</style>