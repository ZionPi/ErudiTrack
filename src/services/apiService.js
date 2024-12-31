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
    const augmentedQuestionText = `${questionText}，尽可能让回答精简，切中要害。举例说明`;
    const response = await apiClient.post('/generate_answer', { question_text: augmentedQuestionText });
    return response.data.answer;
  } catch (error) {
    console.error('生成答案失败', error);
    throw error; // 将错误抛出，以便在组件中处理
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

export default apiClient;