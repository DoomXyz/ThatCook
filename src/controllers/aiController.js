import aiService from '../services/aiService';
import { verifyJWT } from '../middleware/jwtController';

const handleAiChat = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ errCode: 1, errMessage: 'Message is required.' });
    }

    // Extract AccountID from JWT token
    const token = req.cookies?.Token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    const decoded = verifyJWT(token);
    if (!decoded || !decoded.AccountID) {
      return res.status(401).json({ errCode: -1, errMessage: 'Unauthorized.' });
    }

    const result = await aiService.handleAiChat(decoded.AccountID, message, chatHistory || []);
    return res.status(200).json(result);
  } catch (e) {
    console.error('AI Chat Controller Error:', e);
    return res.status(500).json({ errCode: -1, errMessage: 'Internal server error.' });
  }
};

const handleSaveApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ errCode: 1, errMessage: 'API key is required.' });
    }

    const token = req.cookies?.Token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    const decoded = verifyJWT(token);
    if (!decoded || !decoded.AccountID) {
      return res.status(401).json({ errCode: -1, errMessage: 'Unauthorized.' });
    }

    const result = await aiService.saveApiKey(decoded.AccountID, apiKey);
    return res.status(200).json(result);
  } catch (e) {
    console.error('Save API Key Error:', e);
    return res.status(500).json({ errCode: -1, errMessage: 'Internal server error.' });
  }
};

const handleGetApiKey = async (req, res) => {
  try {
    const token = req.cookies?.Token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    const decoded = verifyJWT(token);
    if (!decoded || !decoded.AccountID) {
      return res.status(401).json({ errCode: -1, errMessage: 'Unauthorized.' });
    }

    const result = await aiService.getApiKeyExists(decoded.AccountID);
    return res.status(200).json(result);
  } catch (e) {
    console.error('Get API Key Error:', e);
    return res.status(500).json({ errCode: -1, errMessage: 'Internal server error.' });
  }
};

const handleDeleteApiKey = async (req, res) => {
  try {
    const token = req.cookies?.Token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    const decoded = verifyJWT(token);
    if (!decoded || !decoded.AccountID) {
      return res.status(401).json({ errCode: -1, errMessage: 'Unauthorized.' });
    }

    const result = await aiService.deleteApiKey(decoded.AccountID);
    return res.status(200).json(result);
  } catch (e) {
    console.error('Delete API Key Error:', e);
    return res.status(500).json({ errCode: -1, errMessage: 'Internal server error.' });
  }
};

module.exports = {
  handleAiChat,
  handleSaveApiKey,
  handleGetApiKey,
  handleDeleteApiKey,
};
