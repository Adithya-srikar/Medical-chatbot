import React from 'react';
import ChatBot from './components/ChatBot/ChatBot';
import { ChatProvider } from './context/ChatContext';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-blue-600 mr-2"
              >
                <path d="M8 2v4"></path>
                <path d="M16 2v4"></path>
                <path d="M3 10h18"></path>
                <rect width="18" height="12" x="3" y="6" rx="2"></rect>
              </svg>
              <h1 className="text-xl font-semibold text-gray-800">MediChat</h1>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChatProvider>
          <ChatBot />
        </ChatProvider>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            © 2025 MediChat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;