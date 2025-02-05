import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useOpenAI } from '../hooks/useOpenAI';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TranscriptChatProps {
  transcript: string;
  apiKey: string;
}

export const TranscriptChat: React.FC<TranscriptChatProps> = ({ transcript, apiKey }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendToOpenAI } = useOpenAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Validate transcript
      if (!transcript?.trim()) {
        throw new Error('No transcript data available');
      }

      const prompt = `You are analyzing a transcript of a conversation. Use the following transcript as context for answering the question. Only use information from the transcript to answer.

Transcript:
${transcript}

Question: ${userMessage}`;

      const result = await sendToOpenAI({ apiKey, prompt }, transcript);
      
      if (result?.response?.data) {
        setMessages(prev => [...prev, { role: 'assistant', content: result.response.data }]);
      } else {
        throw new Error('Failed to get response from AI');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      toast.error(errorMessage);
      console.error('Chat error:', error);
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show message if no transcript is available
  if (!transcript?.trim()) {
    return (
      <div className="mt-8 border rounded-lg bg-white shadow-lg p-8 text-center">
        <p className="text-gray-600">No transcript data available for chat interaction.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border rounded-lg bg-white shadow-lg">
      <div className="p-4 border-b bg-purple-50">
        <h3 className="text-lg font-semibold text-purple-900">
          Chat with the Transcript
        </h3>
        <p className="text-sm text-purple-700">
          Ask questions about the transcript and get AI-powered responses
        </p>
      </div>

      <div className="h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {message.content}
                </pre>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the transcript..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};