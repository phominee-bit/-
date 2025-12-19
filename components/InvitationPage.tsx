
import React, { useState } from 'react';
import { EventConfig } from '../types';

interface InvitationPageProps {
  config: EventConfig;
}

const InvitationPage: React.FC<InvitationPageProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="relative w-full flex flex-col items-center py-8 px-4 md:px-8 bg-rose-50/30 overflow-y-auto min-h-screen font-['Montserrat'] z-10">
      <div className="max-w-3xl w-full bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-rose-100 mb-8 animate-fadeIn">
        
        {/* Banner */}
        <div className="h-64 md:h-96 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=1200" 
            alt="Celebration" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 block opacity-80">Арнайы шақыру</span>
            <h1 className="text-4xl md:text-6xl font-black drop-shadow-2xl uppercase tracking-tighter">Мерекелік кеш</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-14 text-center">
          <div className="mb-12">
            <h2 className="text-rose-900 font-bold text-2xl md:text-3xl mb-8 leading-relaxed font-serif-elegant italic">
              «{config.message}»
            </h2>
            <div className="w-20 h-1 bg-rose-600 mx-auto rounded-full opacity-30"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <InfoCard 
              icon="📅" 
              title="Күні" 
              subtitle={config.date} 
              detail={`${config.time}-де басталады`} 
            />
            <InfoCard 
              icon="📍" 
              title="Мекен-жайы" 
              subtitle={config.location} 
              detail="Алматы қаласы" 
            />
          </div>

          <div className="flex flex-col items-center space-y-5">
            {config.address2GIS && (
              <a 
                href={config.address2GIS}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-3 bg-[#1a2332] hover:bg-black text-white font-black py-5 px-10 rounded-2xl shadow-xl transform transition-all active:scale-95 w-full sm:w-auto uppercase tracking-widest text-[11px]"
              >
                <span>2ГИС-те көру</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </a>
            )}

            <button 
              onClick={handleShare}
              className="inline-flex items-center justify-center space-x-2 text-rose-500 font-black py-4 px-8 rounded-2xl hover:bg-rose-50 transition-colors w-full sm:w-auto border-2 border-rose-100 uppercase tracking-widest text-[10px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{copied ? "Көшірілді!" : "Сілтемені бөлісу"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 px-2 mb-16">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform transition-transform hover:scale-105">
            <img 
              src={`https://images.unsplash.com/photo-${[
                '1513297887119-d46091b24bfa',
                '1544273677-c433136021d4',
                '1482245294134-b2428f0d9181',
                '1512389142860-9c449e58a543'
              ][i-1]}?auto=format&fit=crop&q=80&w=300`} 
              alt="Gallery" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <footer className="pb-12 text-rose-300 text-[10px] font-black tracking-[0.4em] text-center uppercase">
        2025 • Жаңа Жылдық Кеш
      </footer>
    </main>
  );
};

const InfoCard: React.FC<{ icon: string; title: string; subtitle: string; detail: string }> = ({ icon, title, subtitle, detail }) => (
  <div className="p-8 rounded-[2rem] bg-rose-50 border border-rose-100 flex flex-col items-center group hover:bg-rose-100 transition-colors">
    <span className="text-4xl mb-4 transform transition-transform group-hover:scale-125">{icon}</span>
    <h3 className="text-rose-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2">{title}</h3>
    <p className="text-rose-950 font-black text-lg leading-tight uppercase tracking-tight">{subtitle || '...'}</p>
    <p className="text-rose-500/70 text-[11px] mt-2 font-bold italic">{detail}</p>
  </div>
);

export default InvitationPage;
