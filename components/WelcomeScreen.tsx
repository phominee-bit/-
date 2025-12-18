
import React from 'react';

interface WelcomeScreenProps {
  onEnter: () => void;
  guestName: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter, guestName }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-rose-50 z-50">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-sm mx-4 transform transition-all hover:scale-105 duration-500 border-4 border-rose-100">
        <div className="mb-6 relative">
          <img 
            src="https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&q=80&w=300" 
            alt="Welcome" 
            className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-rose-200 shadow-md"
          />
          <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2 rounded-full shadow-lg">
            ❤
          </div>
        </div>
        <h1 className="text-2xl font-bold text-rose-800 mb-2">Сәлеметсіз бе, {guestName}!</h1>
        <p className="text-rose-600 mb-8 font-light italic">Сізге арнайы шақыру бар...</p>
        <button 
          onClick={onEnter}
          className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-4 px-10 rounded-full shadow-lg shadow-rose-200 transition-all active:scale-95 animate-bounce"
        >
          Ашу
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
