
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { BookResult, Language } from './types';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ru');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BookResult[]>([]);
  const [history, setHistory] = useState<BookResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const seenSentences = useRef<Set<string>>(new Set());
  const timerInterval = useRef<number | null>(null);

  const t = {
    ru: {
      title: "Генератор текста для синтеза",
      history: "История поиска",
      historyEmpty: "История пуста",
      placeholder: "Введите тему...",
      create: "Создать",
      waiting: "Ожидайте, пожалуйста",
      searching: "Поиск и генерация...",
      download: "Скачать WORD",
      yourRequests: "Ваши запросы",
      error: "Ошибка при создании контента. Пожалуйста, попробуйте еще раз.",
      nowShowing: "Текущий результат"
    },
    kz: {
      title: "Синтездеуге арналған мәтін генераторы",
      history: "Іздеу тарихы",
      historyEmpty: "Тарих бос",
      placeholder: "Тақырыпты енгізіңіз...",
      create: "Жасау",
      waiting: "Күте тұрыңыз",
      searching: "Іздеу және генерация...",
      download: "WORD жүктеу",
      yourRequests: "Сіздің сұраныстарыңыз",
      error: "Мазмұнды жасау кезінде қате кетті. Қайталап көріңіз.",
      nowShowing: "Ағымдағы нәтиже"
    }
  };

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const targetLang = lang === 'ru' ? 'русский' : 'казахский';
      
      const forbiddenTopics = history.map(h => h.title).join(', ');
      
      const systemInstruction = `Ты профессиональный составитель текстов для дикторского озвучивания (SynthPro). 
      Твоя задача: сгенерировать огромный текст по теме "${query}" на 30 МИНУТ чтения.
      
      ПРАВИЛА ИСКЛЮЧЕНИЯ ПОВТОРОВ:
      1. НИКОГДА не используй темы и заголовки, которые уже были созданы: ${forbiddenTopics || 'пока нет'}.
      2. Каждое предложение должно быть абсолютно уникальным. Без повторов.
      
      ПРАВИЛА СТРУКТУРЫ:
      1. ОДНО предложение — это ОДИН блок.
      2. Разделяй предложения ТРЕМЯ переносами строки (\\n\\n\\n). Это критично для диктора.
      3. Одно предложение должно читаться от 3 до 15 секунд.
      
      ПРАВИЛА ТЕКСТА:
      1. ИСПОЛЬЗУЙ ТОЛЬКО ${targetLang.toUpperCase()} ЯЗЫК.
      2. ЦИФРЫ ПИСАТЬ ТОЛЬКО ПРОПИСЬЮ (например, "двадцать пять", а не "25").
      
      Выдай JSON с массивом 'books'.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Подготовь новый уникальный сценарий на 30 минут на языке ${targetLang} по теме: "${query}". Избегай сходства с прошлыми работами.`,
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

      const data = JSON.parse(response.text || '{"books":[]}');
      
      const processedBooks = data.books.map((book: any) => {
        const segments = book.script.split(/\n{3,}/);
        const uniqueSentencesList: string[] = [];
        
        segments.forEach((s: string) => {
          const clean = s.trim().toLowerCase().replace(/[^\w\sа-яёәғіңөұүһ]/gi, '');
          if (clean && !seenSentences.current.has(clean)) {
            seenSentences.current.add(clean);
            uniqueSentencesList.push(s.trim());
          }
        });

        return {
          ...book,
          id: Math.random().toString(36).substr(2, 9),
          script: uniqueSentencesList.join('\n\n\n'),
          timestamp: Date.now()
        };
      });

      setResults(processedBooks);
      setHistory(prev => [...processedBooks, ...prev].slice(0, 50));
      
    } catch (err: any) {
      setError(t[lang].error);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsWord = (book: BookResult) => {
    const segments = book.script.split(/\n{3,}/);
    const formattedHtml = segments
      .filter(s => s.trim().length > 0)
      .map(segment => `<p style="margin-bottom: 30pt; font-family: 'Times New Roman', serif; font-size: 16pt; line-height: 1.6; color: #000000;">${segment.trim()}</p>`)
      .join('');

    const htmlContent = `<html><head><meta charset='utf-8'></head><body style="padding:1in;">${formattedHtml}</body></html>`;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SynthPro_${book.title.replace(/\s+/g, '_')}.doc`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col font-['Inter'] selection:bg-rose-200 overflow-hidden relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-rose-50/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-fadeIn">
          <div className="relative mb-12">
            <div className="absolute inset-0 border-4 border-rose-200 rounded-full animate-[spin_3s_linear_infinite]"></div>
            <div className="absolute -inset-4 border-4 border-rose-100 rounded-full animate-[spin_2s_linear_infinite_reverse] opacity-50"></div>
            <div className="bg-white p-12 rounded-full shadow-2xl relative border-4 border-rose-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-rose-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-black text-rose-900 mb-6 uppercase tracking-tight">{t[lang].searching}</h2>
          <div className="bg-rose-950 text-white px-12 py-4 rounded-full font-mono text-4xl shadow-2xl border-2 border-rose-400">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}

      <header className="bg-rose-600 py-5 px-6 sticky top-0 z-40 shadow-xl border-b border-rose-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`flex items-center gap-2 px-6 py-3 bg-white rounded-full text-rose-600 shadow-lg font-bold uppercase text-xs tracking-[0.1em] transition-all active:scale-95 ${isSidebarOpen ? 'ring-4 ring-rose-300' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t[lang].history}</span>
            </button>
            <h1 className="text-2xl font-black text-white tracking-tighter italic uppercase">Synth Pro</h1>
          </div>

          <div className="flex bg-rose-700 p-1 rounded-full shadow-inner">
            {['ru', 'kz'].map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l as Language)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-white text-rose-600 shadow-md' : 'text-rose-100 hover:bg-rose-500/30'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar History */}
        <aside className={`absolute md:relative z-30 h-full bg-white/95 backdrop-blur-xl border-r border-rose-200 transition-all duration-300 shadow-2xl ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:w-0'}`}>
          <div className="p-8 h-full overflow-y-auto custom-scrollbar w-80">
            <h3 className="text-[10px] font-black text-rose-300 mb-8 uppercase tracking-[0.2em]">{t[lang].yourRequests}</h3>
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-rose-900 font-bold uppercase text-[10px] opacity-20 text-center py-20">{t[lang].historyEmpty}</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="relative group">
                    <button 
                      onClick={() => {
                        setResults([item]);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`w-full text-left bg-white p-5 pr-14 rounded-3xl shadow-sm border-2 transition-all active:scale-95 ${results[0]?.id === item.id ? 'border-rose-400 shadow-rose-100' : 'border-rose-50 hover:border-rose-200'}`}
                    >
                      <p className="text-rose-950 font-bold text-xs truncate uppercase tracking-tight group-hover:text-rose-600">{item.title}</p>
                      <p className="text-[9px] text-rose-300 font-bold mt-1 uppercase tracking-tighter">{new Date(item.timestamp).toLocaleString()}</p>
                    </button>
                    {/* Кнопка быстрого скачивания прямо из истории */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadAsWord(item);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-rose-50 text-rose-400 rounded-full hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                      title={t[lang].download}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className={`flex-1 overflow-y-auto p-6 md:p-16 custom-scrollbar transition-all ${isSidebarOpen ? 'opacity-40 pointer-events-none md:opacity-100 md:pointer-events-auto' : ''}`}>
          <section className="mb-24 text-center max-w-4xl mx-auto z-10 relative">
            <h2 className="text-5xl md:text-8xl font-black text-rose-900 mb-12 tracking-tighter uppercase italic leading-none">
              {t[lang].title.split(' ').slice(0, 2).join(' ')} <br/> {t[lang].title.split(' ').slice(2).join(' ')}
            </h2>

            <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto z-20">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t[lang].placeholder}
                className="w-full pl-10 pr-48 py-8 bg-white border-4 border-rose-100 rounded-[3rem] shadow-2xl focus:border-rose-400 outline-none transition-all text-2xl font-bold text-rose-950 placeholder:text-rose-100 placeholder:italic"
                autoComplete="off"
              />
              <button 
                type="submit"
                disabled={loading}
                className={`absolute right-4 top-4 bottom-4 px-12 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl transition-all active:scale-90 ${loading ? 'bg-slate-200 cursor-not-allowed' : 'bg-slate-600 hover:bg-slate-800 text-white cursor-pointer'}`}
              >
                {loading ? '...' : t[lang].create}
              </button>
            </form>
          </section>

          {error && (
            <div className="max-w-4xl mx-auto p-8 bg-rose-950 text-white font-bold rounded-3xl mb-12 text-center shadow-2xl animate-bounce">
              {error}
            </div>
          )}

          <div className="max-w-5xl mx-auto space-y-24 pb-40">
            {results.length > 0 && (
              <div className="mb-8 flex items-center justify-center">
                 <span className="px-6 py-2 bg-rose-100 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                   {t[lang].nowShowing}
                 </span>
              </div>
            )}
            
            {results.map((book) => (
              <div key={book.id} className="bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl border-4 border-rose-50 animate-fadeIn relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                  <div className="flex-1">
                    <h3 className="text-4xl md:text-6xl font-black text-rose-950 mb-2 leading-none tracking-tight uppercase italic">{book.title}</h3>
                    <p className="text-rose-400 font-bold text-xl uppercase tracking-widest">{book.author}</p>
                  </div>
                  
                  <button 
                    onClick={() => downloadAsWord(book)}
                    className="flex items-center gap-4 bg-rose-950 hover:bg-black text-white font-black py-7 px-14 rounded-full shadow-2xl transition-all active:scale-95 uppercase tracking-widest text-lg"
                  >
                    <span>{t[lang].download}</span>
                  </button>
                </div>

                <div className="relative bg-rose-50/40 rounded-[3.5rem] p-12 md:p-16 border-4 border-white shadow-inner">
                  <div className="whitespace-pre-line text-rose-950 text-2xl md:text-3xl font-bold leading-[2] max-h-[700px] overflow-y-auto custom-scrollbar pr-10 selection:bg-rose-500 selection:text-white">
                    {book.script}
                  </div>
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
