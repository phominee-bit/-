
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
    <main className="relative w-full flex flex-col items-center py-8 px-4 md:px-8 bg-rose-50/30 overflow-y-auto min-h-screen">
      {/* Main Card */}
      <div className="max-w-3xl w-full bg-white/90 backdrop-blur-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-rose-100 mb-8 animate-fadeIn">
        
        {/* Banner */}
        <div className="h-56 md:h-80 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=1200" 
            alt="New Year Vibes" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h1 className="font-cursive text-3xl md:text-5xl drop-shadow-lg">Мерекелік кеш</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10 text-center">
          <div className="mb-10">
            <h2 className="text-rose-600 font-bold text-2xl md:text-4xl mb-6 leading-tight">
              {config.message}
            </h2>
            <div className="w-16 h-1 bg-rose-200 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-10">
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
              detail="Бесағаш 22а" 
            />
          </div>

          <div className="flex flex-col items-center space-y-4">
            <a 
              href={config.address2GIS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transform transition-all active:scale-95 w-full sm:w-auto"
            >
              <span className="text-lg">2ГИС-те көру</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </a>

            <button 
              onClick={handleShare}
              className="inline-flex items-center justify-center space-x-2 text-rose-500 font-semibold py-3 px-6 rounded-xl hover:bg-rose-50 transition-colors w-full sm:w-auto border border-rose-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{copied ? "Көшірілді!" : "Сілтемені бөлісу"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-4xl w-full grid grid-cols-2 md:grid-cols-4 gap-3 px-2 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2 border-white">
            <img 
              src={`https://images.unsplash.com/photo-${[
                '1513297887119-d46091b24bfa',
                '1544273677-c433136021d4',
                '1482245294134-b2428f0d9181',
                '1512389142860-9c449e58a543'
              ][i-1]}?auto=format&fit=crop&q=80&w=300`} 
              alt="Photo" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <footer className="pb-10 text-rose-300 text-xs font-light tracking-widest text-center uppercase">
        22 желтоқсан, 2025 • Алматы
      </footer>
    </main>
  );
};

const InfoCard: React.FC<{ icon: string; title: string; subtitle: string; detail: string }> = ({ icon, title, subtitle, detail }) => (
  <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col items-center">
    <span className="text-3xl mb-3">{icon}</span>
    <h3 className="text-rose-400 text-[9px] font-bold uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-rose-900 font-bold text-base leading-tight">{subtitle}</p>
    <p className="text-rose-500/60 text-[10px] mt-1">{detail}</p>
  </div>
);

export default InvitationPage;
