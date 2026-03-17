import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Trash2, PlusCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';
import Button from '../components/common/Button';

const AIAssistantPage = () => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory();
    }
  }, [isAuthenticated]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await aiService.getChatHistory();
      setChatHistory(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const data = await aiService.chatWithAI(userMessage, null, chatId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      if (!chatId) {
        setChatId(data.chatId);
        loadChatHistory();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMsg = 'Sorry, I encountered an error. Please try again.';
      
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('rate limit') || error.response.data.message.includes('quota')) {
          errorMsg = '🔄 AI Tutor is currently at capacity. Please wait a moment and try again!';
        } else if (error.response.data.message.includes('capacity')) {
          errorMsg = error.response.data.message;
        }
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setChatId(null);
  };

  const loadChat = (chat) => {
    setChatId(chat._id);
    setMessages(chat.messages || []);
  };

  const deleteChat = async (cid, e) => {
    e.stopPropagation();
    try {
      await aiService.deleteChat(cid);
      loadChatHistory();
      if (cid === chatId) startNewChat();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {showHistory && (
        <motion.div initial={{ x: -300 }} animate={{ x: 0 }} className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Button onClick={startNewChat} className="w-full flex items-center justify-center space-x-2">
              <PlusCircle className="h-5 w-5" /><span>New Chat</span>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatHistory.map((chat) => (
              <div key={chat._id} onClick={() => loadChat(chat)} className={`p-3 rounded-lg cursor-pointer transition-colors group flex items-center justify-between ${chat._id === chatId ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <MessageSquare className="h-5 w-5 text-gray-500" />
                  <span className="truncate text-sm">{chat.title}</span>
                </div>
                <button onClick={(e) => deleteChat(chat._id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      <div className="flex-1 flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <MessageSquare className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold gradient-text">AI Tutor</h1>
              <p className="text-sm text-gray-500">Your intelligent learning assistant</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <Bot className="h-24 w-24 mx-auto text-primary-500 mb-6" />
              <h2 className="text-3xl font-bold mb-4">Welcome to IntelliLearn AI</h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">Ask me anything about your studies!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-primary-500' : 'bg-secondary-500'}`}>
                  {message.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
                </div>
                <div className={`max-w-2xl px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-secondary-500"><Bot className="h-5 w-5 text-white" /></div>
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto flex space-x-4">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask me anything..." className="flex-1 px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <Button onClick={handleSend} disabled={!input.trim() || loading} className="rounded-full px-8"><Send className="h-5 w-5" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
