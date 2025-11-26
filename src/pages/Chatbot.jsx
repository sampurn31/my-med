import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserMedications } from '../services/medications';
import { getUserSchedules } from '../services/schedules';
import { getTodayDoseLogs } from '../services/doseLogs';
import { format } from 'date-fns';

export default function Chatbot() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your medication assistant. I can help you with:\n\n• Your current medications\n• Today\'s schedule\n• Missed doses\n• General medication information\n\nWhat would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    medications: [],
    schedules: [],
    doseLogs: [],
  });
  const messagesEndRef = useRef(null);

  // Load user data for personalized responses
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;
      
      try {
        const [meds, scheds, logs] = await Promise.all([
          getUserMedications(currentUser.uid),
          getUserSchedules(currentUser.uid),
          getTodayDoseLogs(currentUser.uid),
        ]);
        
        setUserData({
          medications: meds,
          schedules: scheds,
          doseLogs: logs,
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
  }, [currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced rule-based responses with personalized data
  const getRuleBasedResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    // Greeting
    if (message.match(/^(hi|hello|hey|good morning|good evening)/)) {
      const name = currentUser?.displayName || 'there';
      return `Hello ${name}! How can I assist you with your medications today?`;
    }

    // List my medications
    if (message.includes('my medication') || message.includes('my medicine') || message.includes('what medication') || message.includes('list')) {
      if (userData.medications.length === 0) {
        return 'You don\'t have any medications added yet. Go to the Medications page to add your first medication!';
      }
      
      let response = `You have ${userData.medications.length} medication(s):\n\n`;
      userData.medications.forEach((med, index) => {
        response += `${index + 1}. ${med.name} - ${med.strength} (${med.form})`;
        if (med.pillsRemaining !== null) {
          response += ` - ${med.pillsRemaining} pills remaining`;
        }
        response += '\n';
      });
      return response;
    }

    // Today's schedule
    if (message.includes('today') || message.includes('schedule') || message.includes('when')) {
      const upcoming = userData.doseLogs.filter(log => log.status === 'scheduled');
      const completed = userData.doseLogs.filter(log => log.status === 'taken');
      
      if (userData.doseLogs.length === 0) {
        return 'You don\'t have any scheduled doses for today. Go to the Schedules page to create a medication schedule!';
      }
      
      let response = `📅 Today's Schedule:\n\n`;
      response += `✅ Completed: ${completed.length}\n`;
      response += `⏰ Upcoming: ${upcoming.length}\n\n`;
      
      if (upcoming.length > 0) {
        response += 'Next doses:\n';
        upcoming.slice(0, 3).forEach(log => {
          const med = userData.medications.find(m => m.id === log.medId);
          const time = format(log.scheduledAt.toDate(), 'h:mm a');
          response += `• ${med?.name || 'Unknown'} at ${time}\n`;
        });
      }
      
      return response;
    }

    // Missed doses
    if (message.includes('missed') || message.includes('forgot') || message.includes('skip')) {
      const missed = userData.doseLogs.filter(log => {
        if (log.status !== 'scheduled') return false;
        const scheduledTime = log.scheduledAt.toDate();
        return scheduledTime < new Date();
      });
      
      if (missed.length === 0) {
        return 'Great news! You haven\'t missed any doses today. Keep up the good work! 🎉';
      }
      
      let response = `⚠️ You have ${missed.length} missed dose(s):\n\n`;
      missed.forEach(log => {
        const med = userData.medications.find(m => m.id === log.medId);
        const time = format(log.scheduledAt.toDate(), 'h:mm a');
        response += `• ${med?.name || 'Unknown'} (scheduled for ${time})\n`;
      });
      response += '\nGo to the Dashboard to mark them as taken or skipped.';
      
      return response;
    }

    // Pills remaining / refill
    if (message.includes('pill') || message.includes('refill') || message.includes('running out') || message.includes('how many')) {
      const lowStock = userData.medications.filter(med => 
        med.pillsRemaining !== null && med.pillsRemaining <= 10
      );
      
      if (lowStock.length === 0) {
        return 'All your medications have sufficient stock! 👍';
      }
      
      let response = `⚠️ Low stock alert for ${lowStock.length} medication(s):\n\n`;
      lowStock.forEach(med => {
        response += `• ${med.name}: ${med.pillsRemaining} pills remaining\n`;
      });
      response += '\nConsider refilling these medications soon.';
      
      return response;
    }

    // Reminder / notification setup
    if (message.includes('reminder') || message.includes('notification') || message.includes('alert')) {
      return 'Reminders are sent automatically based on your schedules. To enable notifications:\n\n1. Make sure you\'ve allowed notifications in your browser\n2. Add your medication schedules\n3. Keep the app open or installed as a PWA\n\nNotifications will appear 5 minutes before each scheduled dose.';
    }

    // Side effects
    if (message.includes('side effect') || message.includes('adverse') || message.includes('reaction')) {
      return '⚠️ For information about side effects:\n\n• Check the medication packaging\n• Consult your doctor or pharmacist\n• If experiencing severe side effects, seek immediate medical attention\n\n🚨 Call emergency services if you have: difficulty breathing, chest pain, severe allergic reaction, or loss of consciousness.';
    }

    // Dosage
    if (message.includes('dosage') || message.includes('how much') || message.includes('dose')) {
      return '💊 Dosage Information:\n\n• Always follow your doctor\'s prescription\n• Never change your dosage without consulting a healthcare professional\n• If you\'re unsure, contact your doctor or pharmacist\n\n⚠️ Taking too much or too little can be dangerous.';
    }

    // How to use app
    if (message.includes('how') && (message.includes('use') || message.includes('work') || message.includes('app'))) {
      return '📱 How to use My Meds:\n\n1. **Medications**: Add your medicines with details\n2. **Schedules**: Set when to take each medication\n3. **Dashboard**: View today\'s doses and mark them as taken\n4. **Family**: Add family members to help monitor\n5. **Notifications**: Enable browser notifications for reminders\n\nNeed help with a specific feature?';
    }

    // Help
    if (message.includes('help')) {
      return 'I can help you with:\n\n• 📋 List your medications\n• 📅 Show today\'s schedule\n• ⚠️ Check for missed doses\n• 💊 Check pills remaining\n• 🔔 Setup notifications\n• ℹ️ General medication information\n\nJust ask me anything!';
    }

    // Thank you
    if (message.match(/^(thanks|thank you|thx|ty)/)) {
      return 'You\'re welcome! Stay healthy and don\'t forget to take your medications on time! 💊😊';
    }

    // Default response with suggestions
    return 'I\'m here to help! You can ask me:\n\n• "What are my medications?"\n• "What\'s my schedule today?"\n• "Do I have any missed doses?"\n• "How many pills do I have left?"\n• "How do I set up reminders?"\n\nWhat would you like to know?';
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

