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

export default apiClient;