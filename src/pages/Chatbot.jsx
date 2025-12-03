import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, AlertCircle } from 'lucide-react';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your medication assistant. I can help you with information about your medicines and schedules. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simple rule-based responses (can be replaced with Dialogflow integration)
  const getRuleBasedResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    // Greeting
    if (message.match(/^(hi|hello|hey|good morning|good evening)/)) {
      return 'Hello! How can I assist you with your medications today?';
    }

    // Schedule queries
    if (message.includes('schedule') || message.includes('when')) {
      return 'To view your medication schedule, please go to the Dashboard or Schedules page. I can provide general information about medications, but for your specific schedule, please check those sections.';
    }

    // Medication info
    if (message.includes('medication') || message.includes('medicine') || message.includes('drug')) {
      return 'I can provide general information about medications. Please note that this is for informational purposes only and not medical advice. What would you like to know?';
    }

    // Reminder queries
    if (message.includes('reminder') || message.includes('notification')) {
      return 'Reminders are sent automatically based on your schedules. Make sure you\'ve enabled notifications in your browser settings and added your medication schedules.';
    }

    // Side effects
    if (message.includes('side effect') || message.includes('adverse')) {
      return 'For information about side effects, please consult your doctor or pharmacist. If you\'re experiencing severe side effects, seek medical attention immediately.';
    }

    // Dosage
    if (message.includes('dosage') || message.includes('how much') || message.includes('how many')) {
      return 'Dosage information should come from your doctor or pharmacist. Never change your dosage without consulting a healthcare professional first.';
    }

    // Missed dose
    if (message.includes('missed') || message.includes('forgot')) {
      return 'If you miss a dose, take it as soon as you remember unless it\'s close to your next scheduled dose. Never double up on doses. For specific guidance, consult your healthcare provider.';
    }

    // Help
    if (message.includes('help')) {
      return 'I can help you with:\n• General medication information\n• How to use the app\n• Setting up schedules\n• Managing reminders\n\nWhat would you like to know more about?';
    }

    // Thank you
    if (message.match(/^(thanks|thank you|thx)/)) {
      return 'You\'re welcome! Let me know if you need anything else.';
    }

    // Default response
    return 'I\'m here to provide general information about medications and help you use the app. For specific medical advice, please consult your healthcare provider. Is there something specific I can help you with?';
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: getRuleBasedResponse(input),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medication Assistant</h1>
              <p className="text-sm text-gray-500">Ask me anything about your medications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-b border-yellow-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This chatbot provides general information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your healthcare provider for medical concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-primary-100' : 'text-gray-400'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="btn-primary flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

