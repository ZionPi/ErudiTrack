// src/services/apiService.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api', // 设置你的后端 API 的基础 URL
  headers: {
    'Content-Type': 'application/json'
  }
});

export const generateAnswer = async (questionText) => {
  try {
    const augmentedQuestionText = `${questionText}，这是高级面试题，尽可能让回答精简、完整，切中要害,按顺序给出编号，但是不要遗漏，。举例说明`;
    const response = await apiClient.post('/generate_answer', { question_text: augmentedQuestionText });
    return response.data.answer;
  } catch (error) {
    console.error('生成答案失败', error);
    throw error; // 将错误抛出，以便在组件中处理
  }
};


export const generateTrueFalse = async (questionText) => {
  try {
    const augmentedQuestionText = `根据 "${questionText}"，生成判断题`;
    const structureFormat = JSON.stringify({
      "type": "object",
      "properties": {
        "question": { "type": "string" },
        "answer": { "type": "boolean" }
      },
      "required": ["question", "answer"]
    });
    const response = await apiClient.post(`/generate_answer?structured=true&structure_format=${encodeURIComponent(structureFormat)}`, {
      question_text: augmentedQuestionText
    });
    return response.data.answer; // 后端返回的应该是结构化数据了
  } catch (error) {
    console.error('生成答案失败', error);
    throw error; // 将错误抛出，以便在组件中处理
  }
};

export const generateMultipleChoice = async (questionText) => {
  try {
    const augmentedQuestionText = `根据 ${questionText}，生成选择题`;
    const structureFormat = JSON.stringify({
      "type": "object",
      "properties": {
        "question": { "type": "string" },
        "options": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "text": { "type": "string" },
              "is_correct": { "type": "boolean" }
            },
            "required": ["text", "is_correct"]
          }
        }
      },
      "required": ["question", "options"]
    });
    const response = await apiClient.post(`/generate_answer?structured=true&structure_format=${encodeURIComponent(structureFormat)}`, {
      question_text: augmentedQuestionText
    });
    return response.data.answer; // 后端返回的应该是结构化数据
  } catch (error) {
    console.error('生成选择题失败', error);
    throw error;
  }
};

export const generateFillBlank = async (questionText) => {
  try {
    const augmentedQuestionText = `根据 ${questionText}，生成填空题`;
    const structureFormat = JSON.stringify({
      "type": "object",
      "properties": {
        "question": { "type": "string" },
        "blanks": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "order": { "type": "integer" },
              "answer": { "type": "string" }
            },
            "required": ["order", "answer"]
          }
        }
      },
      "required": ["question", "blanks"]
    });
    const response = await apiClient.post(`/generate_answer?structured=true&structure_format=${encodeURIComponent(structureFormat)}`, {
      question_text: augmentedQuestionText
    });
    return response.data.answer; // 后端返回的应该是结构化数据
  } catch (error) {
    console.error('生成填空题失败', error);
    throw error;
  }
};



export const saveAnswer = async (questionId, newPrompt) => {
  try {
    const response = await apiClient.put(`/questions/${questionId}`, { question_prompt: newPrompt });
    return response.data; // 返回响应数据，可以包含成功消息等
  } catch (error) {
    console.error('保存答案失败', error);
    throw error; // 将错误抛出，以便在组件中处理
  }
};


// 新增接口：创建判断题衍生题
export const createDerivedTrueFalseQuestion = async (originalQuestionId, derivedQuestionText, correctAnswer) => {
  try {
    const response = await apiClient.post('/derived_true_false_question', {
      original_question_id: originalQuestionId,
      derived_question_text: derivedQuestionText,
      correct_answer: correctAnswer
    });
    return response.data;
  } catch (error) {
    console.error('创建判断题衍生题失败', error);
    throw error;
  }
};

// 新增接口：创建选择题衍生题
export const createDerivedMultipleChoiceQuestion = async (originalQuestionId, derivedQuestionText, options) => {
  try {
    const response = await apiClient.post('/derived_multiple_choice_question', {
      original_question_id: originalQuestionId,
      derived_question_text: derivedQuestionText,
      options: options
    });
    return response.data;
  } catch (error) {
    console.error('创建选择题衍生题失败', error);
    throw error;
  }
};

// 新增接口：创建填空题衍生题
export const createDerivedFillInTheBlankQuestion = async (originalQuestionId, derivedQuestionText, blanks) => {
  try {
    const response = await apiClient.post('/derived_fill_in_the_blank_question', {
      original_question_id: originalQuestionId,
      derived_question_text: derivedQuestionText,
      blanks: blanks
    });
    return response.data;
  } catch (error) {
    console.error('创建填空题衍生题失败', error);
    throw error;
  }
};

// 新增接口：提交用户努力指标
export const submitUserEffortMetrics = async (
  userId,
  activityDate,
  timeOnPlatformSeconds = 0,
  answersSubmittedCount = 0,
  questionsViewedCount = 0,
  correctAnswersCount = 0,
  incorrectAnswersCount = 0,
  questionsPracticedToday = 0
) => {
  try {
    const response = await apiClient.post('/submit_user_effort_metrics', {
      user_id: userId,
      activity_date: activityDate,
      time_on_platform_seconds: timeOnPlatformSeconds,
      answers_submitted_count: answersSubmittedCount,
      questions_viewed_count: questionsViewedCount,
      correct_answers_count: correctAnswersCount,
      incorrect_answers_count: incorrectAnswersCount,
      questions_practiced_today: questionsPracticedToday
    });
    return response.data;
  } catch (error) {
    console.error('提交用户努力指标失败', error);
    throw error;
  }
};


// 获取判断题衍生题 (Frontend-side function corresponding to the backend GET endpoint)
export const fetchDerivedTrueFalseQuestions = async (originalQuestionId) => {
  try {
    const response = await apiClient.get(`/derived_true_false_question/${originalQuestionId}`);
    return response.data;
  } catch (error) {
    console.error('获取判断题衍生题失败', error);
    throw error;
  }
};

// 获取选择题衍生题 (Frontend-side function corresponding to the backend GET endpoint)
export const fetchDerivedMultipleChoiceQuestions = async (originalQuestionId) => {
  try {
    const response = await apiClient.get(`/derived_multiple_choice_question/${originalQuestionId}`);
    return response.data;
  } catch (error) {
    console.error('获取选择题衍生题失败', error);
    throw error;
  }
};

// 获取填空题衍生题 (Frontend-side function corresponding to the backend GET endpoint)
export const fetchDerivedFillInTheBlankQuestions = async (originalQuestionId) => {
  try {
    const response = await apiClient.get(`/derived_fill_in_the_blank_question/${originalQuestionId}`);
    return response.data;
  } catch (error) {
    console.error('获取填空题衍生题失败', error);
    throw error;
  }
};


// 新增接口：创建每日练习笔记
export const createDailyPracticeNote = async (userId, questionId, noteText, createdAt) => {
  try {
    const response = await apiClient.post('/daily_practice_notes', {
      user_id: userId,
      question_id: questionId,
      note_text: noteText,
      created_at: createdAt // 确保传递的是 ISO 格式的日期字符串
    });
    return response.data;
  } catch (error) {
    console.error('创建每日练习笔记失败', error);
    throw error;
  }
};

// 新增接口：批量创建每日练习笔记
export const createDailyPracticeNotesBatch = async (notes) => {
  try {
    const response = await apiClient.post('/daily_practice_notes/batch', notes);
    return response.data;
  } catch (error) {
    console.error('批量创建每日练习笔记失败', error);
    throw error;
  }
};

// 新增接口：更新每日练习笔记
export const updateDailyPracticeNote = async (noteId, noteText) => {
  try {
    const response = await apiClient.put(`/daily_practice_notes/${noteId}`, {
      note_text: noteText
    });
    return response.data;
  } catch (error) {
    console.error('更新每日练习笔记失败', error);
    throw error;
  }
};

// 新增接口：删除每日练习笔记
export const deleteDailyPracticeNote = async (noteId) => {
  try {
    const response = await apiClient.delete(`/daily_practice_notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('删除每日练习笔记失败', error);
    throw error;
  }
};

// 新增接口：获取用户的所有每日练习笔记
export const getUserDailyPracticeNotes = async (userId) => {
  try {
    const response = await apiClient.get(`/daily_practice_notes/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`获取用户 ${userId} 的每日练习笔记失败`, error);
    throw error;
  }
};


// 获取所有数据源类型
export const getAllDataSourceTypes = async () => {
  try {
    const response = await apiClient.get('/data_source_types');
    return response.data;
  } catch (error) {
    console.error('获取所有数据源类型失败', error);
    throw error;
  }
};

// 添加一个新的数据源类型
export const createDataSourceType = async (dataSourceType) => {
  try {
    const response = await apiClient.post('/data_source_types', { data_source_type: dataSourceType });
    return response.data;
  } catch (error) {
    console.error('创建数据源类型失败', error);
    throw error;
  }
};

// 删除一个数据源类型
export const deleteDataSourceType = async (dataSourceType) => {
  try {
    await apiClient.delete(`/data_source_types/${dataSourceType}`);
  } catch (error) {
    console.error('删除数据源类型失败', error);
    throw error;
  }
};

// 更新一个数据源类型
export const updateDataSourceType = async (oldDataSourceType, newDataSourceType) => {
  try {
    const response = await apiClient.put(`/data_source_types/${oldDataSourceType}`, { data_source_type: newDataSourceType });
    return response.data;
  } catch (error) {
    console.error('更新数据源类型失败', error);
    throw error;
  }
};
// 获取所有列表
export const getAllCollections = async () => {
  try {
    const response = await apiClient.get('/collections');
    return response.data;
  } catch (error) {
    console.error('获取所有列表失败', error);
    throw error;
  }
};

// 获取单个列表
export const getCollection = async (collectionId) => {
  try {
    const response = await apiClient.get(`/collections/${collectionId}`);
    return response.data;
  } catch (error) {
    console.error(`获取列表 ID ${collectionId} 失败`, error);
    throw error;
  }
};

// 创建列表
export const createCollection = async (collectionData) => {
  try {
    const response = await apiClient.post('/collections', collectionData);
    return response.data;
  } catch (error) {
    console.error('创建列表失败', error);
    throw error;
  }
};

// 批量创建列表
export const createCollectionsBatch = async (collectionsData) => {
  try {
    const response = await apiClient.post('/collections/batch', collectionsData);
    return response.data;
  } catch (error) {
    console.error('批量创建列表失败', error);
    throw error;
  }
};

// 更新列表
export const updateCollection = async (collectionId, collectionData) => {
  try {
    const response = await apiClient.put(`/collections/${collectionId}`, collectionData);
    return response.data;
  } catch (error) {
    console.error(`更新列表 ID ${collectionId} 失败`, error);
    throw error;
  }
};

// 删除列表
export const deleteCollection = async (collectionId) => {
  try {
    const response = await apiClient.delete(`/collections/${collectionId}`);
    return response.data;
  } catch (error) {
    console.error(`删除列表 ID ${collectionId} 失败`, error);
    throw error;
  }
};

// ---------------------- Collection Items API ----------------------

// 获取所有列表项
export const getAllCollectionItems = async () => {
  try {
    const response = await apiClient.get('/collection_items');
    return response.data;
  } catch (error) {
    console.error('获取所有列表项失败', error);
    throw error;
  }
};

// 获取单个列表项
export const getCollectionItem = async (collectionItemId) => {
  try {
    const response = await apiClient.get(`/collection_items/${collectionItemId}`);
    return response.data;
  } catch (error) {
    console.error(`获取列表项 ID ${collectionItemId} 失败`, error);
    throw error;
  }
};

// 根据 collection_id 获取列表项
export const getCollectionItemsByCollection = async (collectionId) => {
  try {
    const response = await apiClient.get(`/collections/${collectionId}/items`);
    return response.data;
  } catch (error) {
    console.error(`获取列表 ${collectionId} 的列表项失败`, error);
    throw error;
  }
};

// 创建列表项
export const createCollectionItem = async (collectionItemData) => {
  try {
    const response = await apiClient.post('/collection_items', collectionItemData);
    return response.data;
  } catch (error) {
    console.error('创建列表项失败', error);
    throw error;
  }
};

// 批量创建列表项
export const createCollectionItemsBatch = async (collectionItemsData) => {
  try {
    const response = await apiClient.post('/collection_items/batch', collectionItemsData);
    return response.data;
  } catch (error) {
    console.error('批量创建列表项失败', error);
    throw error;
  }
};

// 更新列表项
export const updateCollectionItem = async (collectionItemId, collectionItemData) => {
  try {
    const response = await apiClient.put(`/collection_items/${collectionItemId}`, collectionItemData);
    return response.data;
  } catch (error) {
    console.error(`更新列表项 ID ${collectionItemId} 失败`, error);
    throw error;
  }
};

// 删除列表项
export const deleteCollectionItem = async (collectionItemId) => {
  try {
    const response = await apiClient.delete(`/collection_items/${collectionItemId}`);
    return response.data;
  } catch (error) {
    console.error(`删除列表项 ID ${collectionItemId} 失败`, error);
    throw error;
  }
};

// 批量删除列表项
export const deleteCollectionItemsBatch = async (itemIdsToDelete) => {
  try {
    const response = await apiClient.post('/collection_items/batch_delete', itemIdsToDelete);
    return response.data;
  } catch (error) {
    console.error('批量删除列表项失败', error);
    throw error;
  }
};

export default apiClient;