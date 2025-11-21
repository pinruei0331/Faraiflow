
import React, { useState, useRef, useEffect } from 'react';
import { UIContent, Language, ChatMessage } from '../types';
import { generateChatResponse } from '../services/gemini';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface AITutorProps {
  ui: UIContent;
  lang: Language;
}

export const AITutor: React.FC<AITutorProps> = ({ ui, lang }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await generateChatResponse(input, lang);
    
    const botMsg: ChatMessage = { role: 'model', text: responseText };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      {/* Header - Iran Green */}
      <div className="p-4 bg-green-700 text-white flex items-center shadow-sm border-b-4 border-white">
        <Bot className="w-6 h-6 mr-3" />
        <div>
          <h3 className="font-bold text-lg">{ui.welcomeTutor}</h3>
          <p className="text-green-100 text-xs opacity-90">{ui.tutorIntro}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
            <div className="text-center text-slate-400 mt-10 px-6">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{ui.chatPlaceholder}</p>
            </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.text.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={ui.chatPlaceholder}
            className="flex-1 p-3 border border-slate-200 rounded-full focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
