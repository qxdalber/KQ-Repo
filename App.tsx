import React, { useState, useEffect } from 'react';
import MissionControl from './components/MissionControl';
import WordWarp from './components/WordWarp';
import StoryForge from './components/StoryForge';
import CodeBreaker from './components/CodeBreaker';
import ChronoQuest from './components/ChronoQuest';
import EchoChamber from './components/EchoChamber';
import DataDecrypt from './components/DataDecrypt';
import SonicCipher from './components/SonicCipher';
import EchoPilot from './components/EchoPilot';
import { UserProfile, AppView, Language, DifficultyLevel } from './types';

function App() {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>('en');
  
  // Persist state
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('lingua_profile');
    const parsed = saved ? JSON.parse(saved) : {
      xp: 0,
      level: 1,
      streak: 1,
      badges: []
    };
    
    // Migration logic
    if (!parsed.difficulty) {
        parsed.difficulty = 5; 
    } else if (typeof parsed.difficulty === 'string') {
        if (parsed.difficulty === 'Cadet') parsed.difficulty = 2;
        else if (parsed.difficulty === 'Admiral') parsed.difficulty = 9;
        else parsed.difficulty = 5;
    }
    
    return parsed;
  });

  useEffect(() => {
    localStorage.setItem('lingua_profile', JSON.stringify(profile));
  }, [profile]);

  const addXP = (amount: number) => {
    setProfile(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const updateDifficulty = (level: DifficultyLevel) => {
      setProfile(prev => ({ ...prev, difficulty: level }));
  };

  const renderView = () => {
    switch (view) {
      case AppView.WORD_WARP:
        return <WordWarp language={language} difficulty={profile.difficulty} onComplete={(xp) => { addXP(xp); setView(AppView.DASHBOARD); }} onBack={() => setView(AppView.DASHBOARD)} />;
      case AppView.STORY_FORGE:
        return <StoryForge language={language} difficulty={profile.difficulty} onComplete={(xp) => addXP(xp)} onBack={() => setView(AppView.DASHBOARD)} />;
      case AppView.CODE_BREAKER:
        return <CodeBreaker language={language} difficulty={profile.difficulty} onComplete={(xp) => addXP(xp)} onBack={() => setView(AppView.DASHBOARD)} />;
      case AppView.CHRONO_QUEST:
        return <ChronoQuest language={language} difficulty={profile.difficulty} onComplete={(xp) => { addXP(xp); setView(AppView.DASHBOARD); }} onBack={() => setView(AppView.DASHBOARD)} />;
      case AppView.ECHO_CHAMBER:
        return <EchoChamber language={language} difficulty={profile.difficulty} onComplete={(xp) => { addXP(xp); setView(AppView.DASHBOARD); }} onBack={() => setView(AppView.DASHBOARD)} />;
      case AppView.DATA_DECRYPT:
        return <DataDecrypt language={language} difficulty={profile.difficulty} onComplete={(xp) => { addXP(xp); setView(AppView.DASHBOARD); }} onBack={() => setView(AppView.DASHBOARD)} />;
      case AppView.SONIC_CIPHER:
        return <SonicCipher language={language} difficulty={profile.difficulty} onComplete={(xp) => { addXP(xp); setView(AppView.DASHBOARD); }} onBack={() => setView(AppView.DASHBOARD)} />;
      case AppView.ECHO_PILOT:
        return <EchoPilot language={language} difficulty={profile.difficulty} onComplete={(xp) => { addXP(xp); setView(AppView.DASHBOARD); }} onBack={() => setView(AppView.DASHBOARD)} />;
      default:
        return <MissionControl profile={profile} onChangeView={setView} language={language} onUpdateDifficulty={updateDifficulty} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-200 relative selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Eye-Care Background: Deep Slate with soft gradients, no harsh black */}
      <div className="fixed inset-0 bg-slate-950 -z-20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10"></div>
      
      {/* Subtle Warm Overlay for Eye Protection (Blue light reduction simulation) */}
      <div className="fixed inset-0 bg-amber-500/5 mix-blend-overlay pointer-events-none z-50"></div>

      {/* Floating Blobs (Softer) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 soft-glass border-b-0 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setView(AppView.DASHBOARD)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="font-bold text-white text-lg">KC</span>
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-wider brand-font text-white group-hover:text-blue-300 transition-colors">
                KALEN <span className="text-blue-400">COMMAND</span>
                </h1>
                <span className="text-[10px] text-slate-400 tracking-widest uppercase">Educational Command</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             {/* Language Toggle */}
             <button 
               onClick={() => setLanguage(prev => prev === 'en' ? 'zh' : 'en')}
               className="px-4 py-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/30 text-xs font-bold text-blue-200 hover:text-white transition-all backdrop-blur-md"
             >
               {language === 'en' ? '🇺🇸 English' : '🇨🇳 中文模式'}
             </button>

             <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{language === 'zh' ? '学员状态' : 'Cadet Status'}</span>
                <span className="text-sm font-bold text-blue-300">{language === 'zh' ? '等级' : 'Level'} {profile.level}</span>
             </div>
             
             <div className="w-10 h-10 rounded-full bg-slate-800 p-0.5 border-2 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <img src={`https://picsum.photos/seed/${profile.level}/200/200`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {renderView()}
      </main>
      
    </div>
  );
}

export default App;