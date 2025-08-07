import React from 'react';
import { useState } from 'react';
import { BarChart3, Moon, Sun } from 'lucide-react';
import TradeForm from './components/TradeForm';
import TradesList from './components/TradesList';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleTradeAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Trade Journal
            </h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-white hover:bg-gray-50 text-gray-600'
              } shadow-md`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Vertical Quote */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="writing-mode-vertical text-4xl font-bold tracking-wider text-white" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              JUST FUCKKING DO IT BOIII
            </div>
          </div>
        </div>

        {/* Trade Form */}
        <TradeForm onTradeAdded={handleTradeAdded} isDarkMode={isDarkMode} />

        {/* Trades List */}
        <TradesList key={refreshTrigger} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

export default App;
