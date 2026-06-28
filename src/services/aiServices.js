import axios from '../axios';

const handleAiChatApi = (message, chatHistory) => {
  return axios.post('/api/ai-chat', { message, chatHistory });
};

const handleSaveAiKeyApi = (apiKey) => {
  return axios.post('/api/ai-save-key', { apiKey });
};

const handleGetAiKeyApi = () => {
  return axios.get('/api/ai-get-key');
};

const handleDeleteAiKeyApi = () => {
  return axios.delete('/api/ai-delete-key');
};

export { handleAiChatApi, handleSaveAiKeyApi, handleGetAiKeyApi, handleDeleteAiKeyApi };
