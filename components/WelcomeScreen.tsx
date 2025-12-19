
import React from 'react';

interface WelcomeScreenProps {
  onEnter: () => void;
  guestName: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter, guestName }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-rose-50/80 backdrop-blur-md z-50 font-['Montserrat']">
      <div className="text-center p-10 bg-white rounded-[3rem] shadow-2xl max-w-sm mx-4 transform transition-all hover:scale-105 duration-500 border border-rose-100">
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto rounded-full bg-rose-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
             <img 
              src="https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&q=80&w=300" 
              alt="Welcome" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-pulse">
            ❤
          </div>
        </div>
        <h1 className="text-2xl font-black text-rose-900 mb-2 uppercase tracking-tight">Сәлеметсіз бе, {guestName}!</h1>
        <p className="text-rose-400 mb-10 font-bold text-[10px] uppercase tracking-[0.2em] italic">Сізге арнайы шақыру бар...</p>
        <button 
          onClick={onEnter}
          className="bg-[#1a2332] hover:bg-black text-white font-black py-4 px-12 rounded-full shadow-xl transition-all active:scale-95 uppercase tracking-[0.2em] text-[10px]"
        >
          Ашу
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
