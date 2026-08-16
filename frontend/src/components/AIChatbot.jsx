import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Namaste! 👋 I am StayHub AI. Looking for stay recommendations, budget options, or a quick travel plan? Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', { message: userMessage });
      const replyText = res.data?.reply || "I didn't quite get that. Could you try asking in another way?";
      setMessages(prev => [...prev, { sender: 'ai', text: replyText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't reach the AI server. Please make sure the Gemini API key is configured!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1050 }}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="card border-0 shadow-lg mb-3 rounded-4 overflow-hidden" 
          style={{ width: '360px', height: '480px', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-robot fs-5"></i>
              <div>
                <h6 className="mb-0 fw-bold">StayHub AI Assistant</h6>
                <small style={{ fontSize: '11px', opacity: 0.9 }}>Online • Powered by Gemini</small>
              </div>
            </div>
            <button 
              className="btn btn-sm text-white p-0 border-0 fs-5" 
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Messages Body */}
          <div className="card-body overflow-auto p-3 bg-light d-flex flex-column gap-2" style={{ flex: 1 }}>
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`d-flex ${m.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div 
                  className={`p-2 px-3 rounded-4 shadow-sm small ${
                    m.sender === 'user' 
                      ? 'bg-danger text-white' 
                      : 'bg-white text-dark border'
                  }`}
                  style={{ maxWidth: '82%', whiteSpace: 'pre-wrap' }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="d-flex justify-content-start">
                <div className="bg-white text-muted p-2 px-3 rounded-4 border small d-flex align-items-center gap-2">
                  <span className="spinner-border spinner-border-sm text-danger" role="status"></span>
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="p-2 bg-white border-top d-flex gap-2">
            <input 
              type="text" 
              className="form-control rounded-pill border small px-3" 
              placeholder="Ask about stays, Goa, Wi-Fi..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              className="btn btn-danger rounded-circle p-2 px-3 d-flex align-items-center justify-content-center"
              disabled={loading || !input.trim()}
            >
              <i className="fa-solid fa-paper-plane text-white small"></i>
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        className="btn btn-danger rounded-pill shadow-lg d-flex align-items-center gap-2 px-3 py-2 fw-bold text-white border-0"
        onClick={() => setIsOpen(!isOpen)}
        style={{ fontSize: '15px' }}
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-wand-magic-sparkles'} fs-5`}></i>
        <span>{isOpen ? 'Close AI' : 'Ask AI'}</span>
      </button>
    </div>
  );
};

export default AIChatbot;