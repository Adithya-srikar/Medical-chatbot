import React from 'react';
import { Message, MessageOption } from '../../types';

interface ChatMessageProps {
  message: Message;
  onOptionClick: (option: MessageOption) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOptionClick }) => {
  const { text, sender, options } = message;
  
  // Format message text to preserve newlines
  const formattedText = text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
  
  if (sender === 'bot') {
    return (
      <div className="flex items-start space-x-2 animate-fadeIn">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        </div>
        <div className="flex flex-col max-w-[80%]">
          <div className="bg-blue-50 p-3 rounded-lg rounded-tl-none text-gray-800">
            {formattedText}
          </div>
          
          {options && options.length > 0 && (
            <div className="mt-2 flex flex-col space-y-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  className="text-left px-4 py-2 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors text-blue-700"
                  onClick={() => onOptionClick(option)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-start justify-end space-x-2 animate-fadeIn">
      <div className="flex flex-col max-w-[80%]">
        <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none text-white">
          {formattedText}
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    </div>
  );
};

export default ChatMessage;