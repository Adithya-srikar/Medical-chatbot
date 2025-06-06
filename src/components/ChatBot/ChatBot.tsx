import React, { useRef, useEffect, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChat } from '../../context/ChatContext';
import { MessageOption } from '../../types';

const ChatBot: React.FC = () => {
  const { 
    messages, 
    isLoading, 
    sendUserMessage, 
    selectDoctor, 
    selectDate, 
    selectTimeSlot,
    confirmAppointment,
    resetChat
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [showReasonInput, setShowReasonInput] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (text.trim() === '') return;
    
    sendUserMessage(text);
    setUserInput('');
  };

  const handleOptionClick = async (option: MessageOption) => {
    // Create a user message showing their selection
    const selectionMessage = {
      id: Date.now().toString(),
      text: option.text,
      sender: 'user' as const,
      timestamp: new Date(),
    };
    
    // Add message to the chat context
    useChat().addMessage(selectionMessage);
    
    // Handle different option actions
    switch (option.action) {
      case 'select-doctor':
        const doctors = await fetchDoctors();
        const selectedDoctor = doctors.find(doc => doc.id === option.value);
        if (selectedDoctor) {
          selectDoctor(selectedDoctor);
        }
        break;
        
      case 'select-date':
        selectDate(option.value);
        break;
        
      case 'select-time':
        const timeSlots = useChat().availableTimeSlots;
        const selectedTimeSlot = timeSlots.find(slot => slot.id === option.value);
        if (selectedTimeSlot) {
          selectTimeSlot(selectedTimeSlot);
          setShowReasonInput(true);
        }
        break;
        
      case 'confirm-appointment':
        if (option.value === 'yes') {
          finalizeAppointment();
        } else {
          resetChat();
        }
        break;
        
      case 'reset-chat':
        resetChat();
        break;
        
      default:
        break;
    }
  };

  const handleReasonSubmit = () => {
    if (reason.trim() === '') return;
    
    // Create a user message showing their reason
    const reasonMessage = {
      id: Date.now().toString(),
      text: reason,
      sender: 'user' as const,
      timestamp: new Date(),
    };
    
    // Add message to the chat context
    useChat().addMessage(reasonMessage);
    
    // Send the reason to the context
    confirmAppointment(reason);
    
    // Reset local state
    setReason('');
    setShowReasonInput(false);
  };

  const finalizeAppointment = async () => {
    // This will trigger the booking API call in the context
    await useChat().addMessage({
      id: Date.now().toString(),
      text: 'Yes, please confirm my appointment',
      sender: 'user',
      timestamp: new Date(),
    });
  };

  const fetchDoctors = async () => {
    try {
      return await import('../../services/api').then(api => api.fetchDoctors());
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px] bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 p-4 text-white">
        <h2 className="text-lg font-semibold">Medical Assistant</h2>
        <p className="text-sm text-blue-100">Book appointments with ease</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            onOptionClick={handleOptionClick} 
          />
        ))}
        
        {/* Show typing indicator when loading */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
        
        {/* Reason input form */}
        {showReasonInput && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for visit:
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your reason for this appointment..."
            ></textarea>
            <button
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={handleReasonSubmit}
            >
              Submit
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onSend={handleSendMessage}
        disabled={isLoading || showReasonInput}
      />
    </div>
  );
};

export default ChatBot;