
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { BookResult, Language, EventConfig } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import InvitationPage from './components/InvitationPage';

const SakuraBackground: React.FC = () => {
  const petals = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 8 + 4}px`,
      duration: `${Math.random() * 12 + 8}s`,
      delay: `${Math.random() * 10}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((p) => (
        <div
          key={p.id}
          className="sakura sakura-anim"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ru');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BookResult[]>([]);
  const [history, setHistory] = useState<BookResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Invitation logic
  const [inviteData, setInviteData] = useState<EventConfig | null>(null);
  const [inviteGuest, setInviteGuest] = useState('');
  const [hasEnteredInvite, setHasEnteredInvite] = useState(false);

  const seenSentences = useRef<Set<string>>(new Set());
  const timerInterval = useRef<number | null>(null);
  const isCancelled = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const guest = params.get('to');
    const msg = params.get('msg');
    if (guest && msg) {
      setInviteGuest(decodeURIComponent(guest));
      setInviteData({
        message: decodeURIComponent(msg),
        date: decodeURIComponent(params.get('date') || ''),
        time: decodeURIComponent(params.get('time') || ''),
        location: decodeURIComponent(params.get('loc') || ''),
        address2GIS: decodeURIComponent(params.get('map') || '')
      });
    }
  }, []);

  useEffect(() => {
    if (loading) {
      setTimer(0);
      timerInterval.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [loading]);

  const t = {
    ru: {
      title: "Генератор текста для синтеза",
      history: "История поиска",
      historyEmpty: "История пуста",
      placeholder: "Введите тему...",
      create: "Создать",
      searching: "Поиск и генерация...",
      download: "Скачать WORD",
      yourRequests: "Ваши запросы",
      error: "Ошибка при создании контента. Пожалуйста, попробуйте еще раз.",
      nowShowing: "Текущий результат",
      cancel: "Отменить"
    },
    kz: {
      title: "Синтездеуге арналған мәтін генераторы",
      history: "Іздеу тарихы",
      historyEmpty: "Тарих бос",
      placeholder: "Тақырыпты енгізіңіз...",
      create: "Жасау",
      searching: "Іздеу и генерация...",
      download: "WORD жүктеу",
      yourRequests: "Сіздің сұраныстарыңыз",
      error: "Мазмұнды жасау кезінде қате кетті. Қайталап көріңіз.",
      nowShowing: "Ағымдағы нәтиже",
      cancel: "Болдырмау"
    }
  };

  const handleCancel = () => {
    isCancelled.current = true;
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    isCancelled.current = false;
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const targetLang = lang === 'ru' ? 'русский' : 'казахский';
      const forbiddenTopics = history.map(h => h.title).join(', ');
      
      const systemInstruction = `Ты профессиональный составитель текстов для дикторского озвучивания (SynthPro). 
      Твоя задача: сгенерировать огромный текст по теме "${query}" на 30 МИНУТ чтения.
      ЦИФРЫ ПИСАТЬ ТОЛЬКО ПРОПИСЬЮ. Разделяй предложения ТРЕМЯ переносами строки (\\n\\n\\n).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Подготовь уникальный сценарий на языке ${targetLang} по теме: "${query}".`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              books: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    author: { type: Type.STRING },
                    category: { type: Type.STRING },
                    script: { type: Type.STRING }
                  },
                  required: ["title", "author", "category", "script"]
                }
              }
            },
            required: ["books"]
          }
        }
      });

      if (isCancelled.current) return;

      const data = JSON.parse(response.text || '{"books":[]}');
      const processedBooks = data.books.map((book: any) => ({
        ...book,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      }));

      setResults(processedBooks);
      setHistory(prev => [...processedBooks, ...prev].slice(0, 50));
    } catch (err: any) {
      if (!isCancelled.current) setError(t[lang].error);
    } finally {
      if (!isCancelled.current) setLoading(false);
    }
  };

  const downloadAsWord = (book: BookResult) => {
    const segments = book.script.split(/\n{3,}/);
    const formattedHtml = segments.map(s => `<p style="margin-bottom: 20pt; font-family: 'Times New Roman'; font-size: 14pt;">${s.trim()}</p>`).join('');
    const blob = new Blob(['\ufeff', `<html><body>${formattedHtml}</body></html>`], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SynthPro_${book.title}.doc`;
    link.click();
  };

  // 1. Show Invitation if parameters exist in URL
  if (inviteData) {
    return (
      <div className="min-h-screen bg-rose-50 font-['Montserrat'] relative overflow-hidden">
        <SakuraBackground />
        {!hasEnteredInvite ? (
          <WelcomeScreen guestName={inviteGuest} onEnter={() => setHasEnteredInvite(true)} />
        ) : (
          <InvitationPage config={inviteData} />
        )}
      </div>
    );
  }

  // 2. Main Generator Website (synthPro) - No password anymore
  return (
    <div className="min-h-screen bg-rose-50 flex flex-col font-['Montserrat'] selection:bg-rose-200 overflow-hidden relative">
      <SakuraBackground />
      
      {loading && (
        <div className="fixed inset-0 z-[100] bg-rose-50/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-fadeIn">
          <div className="relative mb-8 w-64 h-64 flex items-center justify-center">
            <div className="absolute inset-0 border-rose-200 rounded-full animate-soundwave"></div>
            <div className="w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center z-10">
              <svg className="animate-spin h-12 w-12 text-rose-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-black text-rose-900 mb-8 uppercase tracking-widest">{t[lang].searching}</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white px-8 py-4 rounded-full shadow-lg border-2 border-rose-100 font-mono text-2xl font-bold text-rose-900">
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </div>
            <button onClick={handleCancel} className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors">
              {t[lang].cancel}
            </button>
          </div>
        </div>
      )}

      <header className="bg-rose-600 sticky top-0 z-40 header-glow">
        <div className="max-w-7xl mx-auto py-3 px-6 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-black shadow-lg font-bold uppercase text-[9px] tracking-widest transition-all"
          >
            {t[lang].history}
          </button>
          <h1 className="text-lg font-black text-white italic uppercase">Synth Pro</h1>
          <div className="flex bg-rose-700/50 p-1 rounded-full border border-rose-500/30">
            {['ru', 'kz'].map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l as Language)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${lang === l ? 'bg-white text-rose-600 shadow-md' : 'text-rose-100'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="red-line-decoration"></div>
      </header>

      <div className="flex-1 flex overflow-hidden z-10">
        <aside className={`bg-white/95 backdrop-blur-xl transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
           <div className="p-6 h-full overflow-y-auto custom-scrollbar">
             <h3 className="text-[10px] font-black text-black mb-4 uppercase tracking-[0.2em]">{t[lang].yourRequests}</h3>
             <div className="space-y-3">
               {history.length === 0 ? <p className="text-[10px] opacity-30 uppercase font-bold text-center py-10">{t[lang].historyEmpty}</p> : 
                 history.map(item => (
                   <button key={item.id} onClick={() => setResults([item])} className="w-full text-left p-4 bg-white border-2 border-rose-50 rounded-xl hover:border-rose-200 transition-all">
                     <p className="text-[10px] font-bold text-black uppercase truncate">{item.title}</p>
                   </button>
                 ))
               }
             </div>
           </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <section className="mt-8 mb-12 text-center max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight uppercase mb-8">{t[lang].title}</h2>
            <form onSubmit={handleSearch} className="relative group">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t[lang].placeholder}
                className="w-full px-8 py-5 bg-white border-2 border-rose-100 rounded-full shadow-xl focus:border-rose-400 outline-none transition-all text-base font-semibold"
              />
              <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 px-8 bg-rose-950 text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                {t[lang].create}
              </button>
            </form>
          </section>

          <div className="max-w-3xl mx-auto space-y-12 pb-20">
            {results.map((book) => (
              <div key={book.id} className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-rose-100 animate-fadeIn">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-rose-950 uppercase">{book.title}</h3>
                    <p className="text-rose-300 font-bold text-[10px] uppercase tracking-widest">{book.author}</p>
                  </div>
                  <button onClick={() => downloadAsWord(book)} className="p-3 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-950 hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  </button>
                </div>
                <div className="bg-rose-50/30 rounded-3xl p-6 font-serif-elegant whitespace-pre-line text-rose-900 leading-relaxed text-sm max-h-96 overflow-y-auto custom-scrollbar">
                  {book.script}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
