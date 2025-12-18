
import React, { useState, useEffect, useRef } from 'react';
import InvitationPage from './components/InvitationPage';
import WelcomeScreen from './components/WelcomeScreen';
import { AppState, EventConfig } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.WELCOME);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Получаем имя из URL параметров (?name=...)
  const [guestName, setGuestName] = useState("Мөлдір");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get('name');
    if (nameParam) {
      setGuestName(nameParam);
    }
  }, []);

  const config: EventConfig = {
    guestName: guestName,
    date: "22.12.2025",
    time: "18:00",
    location: "Алматы, Бесағаш 22а",
    address2GIS: "https://2gis.kz/almaty/search/Бесагаш 22а",
    message: `${guestName}, Сізді 22 күні Алматы қаласында күтеміз!`
  };

  const startCelebration = () => {
    setState(AppState.INVITATION);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen relative selection:bg-rose-200">
      <audio 
        ref={audioRef}
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" 
        loop
      />
      
      {state === AppState.WELCOME ? (
        <WelcomeScreen onEnter={startCelebration} guestName={guestName} />
      ) : (
        <>
          <InvitationPage config={config} />
          {/* Music Toggle Button */}
          <button 
            onClick={toggleMusic}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center justify-center border-2 border-rose-200 text-rose-500 hover:scale-110 active:scale-90 transition-all"
            title="Музыканы қосу/өшіру"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {isPlaying && <span className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping opacity-25"></span>}
          </button>
        </>
      )}

      <HeartsContainer />
    </div>
  );
};

const HeartsContainer: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: string; delay: string; duration: string; size: string; opacity: number }[]>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${8 + Math.random() * 10}s`,
      size: `${14 + Math.random() * 20}px`,
      opacity: 0.2 + Math.random() * 0.4
    }));
    setHearts(newHearts);
  }, []);

  return (
    <>
      {hearts.map(h => (
        <div 
          key={h.id}
          className="heart-particle"
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            fontSize: h.size,
            opacity: h.opacity
          }}
        >
          ❤
        </div>
      ))}
    </>
  );
};

export default App;
