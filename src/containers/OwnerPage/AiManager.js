import React, { useState, useEffect, useRef } from 'react';
import './AiManager.scss';
import { handleAiChatApi, handleSaveAiKeyApi, handleGetAiKeyApi, handleDeleteAiKeyApi } from '../../services/aiServices';

const AiManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyExists, setApiKeyExists] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Xin chào! Tôi là **AI Agent** - trợ lý kinh doanh thông minh của bạn.\n\nTôi có thể giúp bạn:\n- 📊 Phân tích doanh thu & dự đoán xu hướng\n- ⚠️ Cảnh báo thông minh\n- 🔧 **Tạo tài khoản**, đổi trạng thái hóa đơn, quản lý coupon\n- 📦 Cập nhật tồn kho, giá sản phẩm\n- 🔍 Tìm kiếm hóa đơn, sản phẩm, tài khoản\n\nHãy ra lệnh hoặc hỏi tôi bất cứ điều gì!',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkApiKey = async () => {
    try {
      const res = await handleGetAiKeyApi();
      if (res && res.errCode === 0) {
        setApiKeyExists(res.exists);
      }
    } catch (e) {
      console.error('Error checking API key:', e);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) return;
    setIsSavingKey(true);
    try {
      const res = await handleSaveAiKeyApi(apiKeyInput.trim());
      if (res && res.errCode === 0) {
        setApiKeyExists(true);
        setApiKeyInput('');
        setIsSettingsOpen(false);
      }
    } catch (e) {
      console.error('Error saving key:', e);
    }
    setIsSavingKey(false);
  };

  const handleDeleteKey = async () => {
    try {
      const res = await handleDeleteAiKeyApi();
      if (res && res.errCode === 0) {
        setApiKeyExists(false);
        setApiKeyInput('');
      }
    } catch (e) {
      console.error('Error deleting key:', e);
    }
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build chat history (exclude system welcome message)
      const chatHistory = messages.filter((m) => m.role !== 'system').slice(-10);

      const res = await handleAiChatApi(trimmed, chatHistory);
      if (res && res.errCode === 0) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.data.message }]);
        if (res.data.alerts && res.data.alerts.length > 0) {
          setAlerts(res.data.alerts);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `⚠️ ${res?.errMessage || 'Lỗi khi xử lý. Vui lòng thử lại.'}` },
        ]);
      }
    } catch (e) {
      console.error('Error sending message:', e);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Lỗi kết nối. Vui lòng kiểm tra server và thử lại.' },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (query) => {
    setInputValue(query);
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
    return { __html: html };
  };

  const quickActions = [
    { label: '📊 Doanh thu tháng này?', query: 'Doanh thu tháng này so với tháng trước thế nào?' },
    { label: '📈 Dự đoán doanh thu?', query: 'Dự đoán doanh thu cuối tháng này là bao nhiêu?' },
    { label: '🔧 Tạo tk test', query: 'Hãy tạo 1 tài khoản khách hàng để tôi test chức năng' },
    { label: '💳 Chuyển PEND→PAID', query: 'Hãy chuyển toàn bộ hóa đơn Chờ thanh toán hôm nay sang Đã thanh toán' },
    { label: '🏆 Top sản phẩm?', query: 'Top sản phẩm bán chạy nhất tháng này là gì?' },
    { label: '🎟️ Tạo coupon giảm giá', query: 'Hãy tạo 1 mã giảm giá 20% cho tháng này' },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button className={`ai-toggle-btn ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)} title="AI Manager">
        <span className="ai-toggle-icon">{isOpen ? '✕' : '🤖'}</span>
      </button>

      {/* Chat Panel */}
      <div className={`ai-manager-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="ai-header">
          <div className="ai-header-title">
            <span className="ai-header-icon">🤖</span>
            <span className="ai-header-text">AI Agent</span>
            <span className="ai-header-badge">AGENT</span>
          </div>
          <div className="ai-header-actions">
            <button className="ai-header-btn" onClick={() => setIsSettingsOpen(true)} title="Settings">
              ⚙️
            </button>
            <button className="ai-header-btn" onClick={() => setIsOpen(false)} title="Đóng">
              ✕
            </button>
          </div>
        </div>

        {/* Alert Banner */}
        {alerts.length > 0 && showAlerts && (
          <div className="ai-alert-banner">
            <div className="ai-alert-header" onClick={() => setShowAlerts(!showAlerts)}>
              <span>⚠️ {alerts.length} cảnh báo</span>
              <span className="ai-alert-toggle">▼</span>
            </div>
            <div className="ai-alert-list">
              {alerts.map((alert, idx) => (
                <div key={idx} className={`ai-alert-item ${alert.severity}`}>
                  <span>{alert.icon}</span>
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="ai-quick-actions">
            {quickActions.map((action, idx) => (
              <button key={idx} className="ai-quick-btn" onClick={() => handleQuickAction(action.query)}>
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="ai-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`ai-message ${msg.role}`}>
              {msg.role === 'assistant' && <div className="ai-message-avatar">🤖</div>}
              <div className="ai-message-bubble" dangerouslySetInnerHTML={formatMessage(msg.content)} />
            </div>
          ))}
          {isLoading && (
            <div className="ai-message assistant">
              <div className="ai-message-avatar">🤖</div>
              <div className="ai-message-bubble typing">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-input-area">
          <textarea
            className="ai-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ra lệnh hoặc hỏi AI Agent..."
            rows={1}
            disabled={isLoading}
          />
          <button className="ai-send-btn" onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
            ➤
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="ai-settings-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="ai-settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-settings-header">
              <h3>⚙️ AI Manager Settings</h3>
              <button className="ai-settings-close" onClick={() => setIsSettingsOpen(false)}>
                ✕
              </button>
            </div>
            <div className="ai-settings-body">
              <div className="ai-settings-status">
                <span>Trạng thái API Key:</span>
                <span className={`ai-key-status ${apiKeyExists ? 'active' : 'inactive'}`}>{apiKeyExists ? '✅ Đã cấu hình' : '❌ Chưa cấu hình'}</span>
              </div>
              <div className="ai-settings-field">
                <label>Groq API Key</label>
                <input type="password" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="gsk_..." className="ai-settings-input" />
                <small className="ai-settings-hint">
                  Lấy API key tại{' '}
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">
                    console.groq.com
                  </a>
                </small>
              </div>
              <div className="ai-settings-actions">
                <button className="ai-settings-save" onClick={handleSaveKey} disabled={isSavingKey || !apiKeyInput.trim()}>
                  {isSavingKey ? 'Đang lưu...' : '💾 Lưu API Key'}
                </button>
                {apiKeyExists && (
                  <button className="ai-settings-delete" onClick={handleDeleteKey}>
                    🗑️ Xóa Key
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiManager;
