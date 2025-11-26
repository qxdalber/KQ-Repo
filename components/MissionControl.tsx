import React from 'react';
import { UserProfile, AppView, Language, DifficultyLevel } from '../types';

interface Props {
  profile: UserProfile;
  onChangeView: (view: AppView) => void;
  language: Language;
  onUpdateDifficulty: (level: DifficultyLevel) => void;
}

const MissionControl: React.FC<Props> = ({ profile, onChangeView, language, onUpdateDifficulty }) => {
  const isZh = language === 'zh';

  const missions = [
    {
      view: AppView.WORD_WARP,
      title: isZh ? '词汇跃迁' : 'Word Warp',
      desc: isZh ? '探索新单词' : 'Vocabulary Discovery',
      colorClass: 'from-blue-500/20 to-blue-600/5 border-blue-400/20 text-blue-300',
      iconColor: 'bg-blue-500',
      icon: "🌌"
    },
    {
      view: AppView.STORY_FORGE,
      title: isZh ? '故事熔炉' : 'Story Forge',
      desc: isZh ? '互动冒险故事' : 'Interactive Adventure',
      colorClass: 'from-purple-500/20 to-purple-600/5 border-purple-400/20 text-purple-300',
      iconColor: 'bg-purple-500',
      icon: "📚"
    },
    {
      view: AppView.CODE_BREAKER,
      title: isZh ? '代码破译' : 'Code Breaker',
      desc: isZh ? '语法修复任务' : 'Syntax Repair',
      colorClass: 'from-emerald-500/20 to-emerald-600/5 border-emerald-400/20 text-emerald-300',
      iconColor: 'bg-emerald-500',
      icon: "🧩"
    },
    {
      view: AppView.CHRONO_QUEST,
      title: isZh ? '时空任务' : 'Chrono Quest',
      desc: isZh ? '时态掌握' : 'Master Tenses',
      colorClass: 'from-amber-500/20 to-amber-600/5 border-amber-400/20 text-amber-300',
      iconColor: 'bg-amber-500',
      icon: "⏳"
    },
    {
      view: AppView.ECHO_CHAMBER,
      title: isZh ? '回声室' : 'Echo Chamber',
      desc: isZh ? '完形填空' : 'Cloze Test',
      colorClass: 'from-cyan-500/20 to-cyan-600/5 border-cyan-400/20 text-cyan-300',
      iconColor: 'bg-cyan-500',
      icon: "🔋"
    },
    {
      view: AppView.DATA_DECRYPT,
      title: isZh ? '数据解密' : 'Data Decrypt',
      desc: isZh ? '阅读理解' : 'Reading Skills',
      colorClass: 'from-rose-500/20 to-rose-600/5 border-rose-400/20 text-rose-300',
      iconColor: 'bg-rose-500',
      icon: "📂"
    },
    {
        view: AppView.SONIC_CIPHER,
        title: isZh ? '声波密码' : 'Sonic Cipher',
        desc: isZh ? '听力训练' : 'Listening Skills',
        colorClass: 'from-indigo-500/20 to-indigo-600/5 border-indigo-400/20 text-indigo-300',
        iconColor: 'bg-indigo-500',
        icon: "🎧"
      },
      {
        view: AppView.ECHO_PILOT,
        title: isZh ? '回声领航' : 'Echo Pilot',
        desc: isZh ? '口语练习' : 'Speaking Practice',
        colorClass: 'from-fuchsia-500/20 to-fuchsia-600/5 border-fuchsia-400/20 text-fuchsia-300',
        iconColor: 'bg-fuchsia-500',
        icon: "🎙️"
      }
  ];

  const getRankTitle = (level: number, lang: 'en' | 'zh') => {
    const titles = [
        { en: 'Rookie', zh: '新兵' }, // 1
        { en: 'Cadet', zh: '学员' },  // 2
        { en: 'Scout', zh: '侦查员' }, // 3
        { en: 'Pilot', zh: '飞行员' }, // 4
        { en: 'Captain', zh: '舰长' }, // 5
        { en: 'Major', zh: '少校' }, // 6
        { en: 'Commander', zh: '指挥官' }, // 7
        { en: 'Colonel', zh: '上校' }, // 8
        { en: 'General', zh: '将军' }, // 9
        { en: 'Admiral', zh: '上将' }, // 10
    ];
    return lang === 'zh' ? titles[level - 1].zh : titles[level - 1].en;
  };

  const getRankDescription = (level: number, lang: 'en' | 'zh') => {
    if (level === 1) return lang === 'zh' ? '剑桥 Super Minds 入门级 (Pre-A1)' : 'Cambridge Super Minds Starter (Pre-A1)';
    if (level === 2) return lang === 'zh' ? '剑桥 Super Minds 第1级 (A1)' : 'Cambridge Super Minds Level 1 (A1)';
    if (level === 3) return lang === 'zh' ? '剑桥 Super Minds 第2级 (A1+)' : 'Cambridge Super Minds Level 2 (A1+)';
    if (level === 4) return lang === 'zh' ? '剑桥 Super Minds 第3级 (A2)' : 'Cambridge Super Minds Level 3 (A2)';
    if (level === 5) return lang === 'zh' ? '剑桥 Super Minds 第4级 (A2+)' : 'Cambridge Super Minds Level 4 (A2+)';
    if (level === 6) return lang === 'zh' ? '剑桥 Super Minds 第5级 (B1)' : 'Cambridge Super Minds Level 5 (B1)';
    if (level === 7) return lang === 'zh' ? '剑桥 Super Minds 第6级 (B1+)' : 'Cambridge Super Minds Level 6 (B1+)';
    if (level === 8) return lang === 'zh' ? '中高级挑战 (B2)' : 'Challenge: CEFR B2 (Upper Int.)';
    if (level === 9) return lang === 'zh' ? '高级挑战 (B2+)' : 'Challenge: CEFR B2+';
    return lang === 'zh' ? '专家级挑战 (C2)' : 'Challenge: CEFR C2 (Mastery)';
  };

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="text-center space-y-3">
        <h2 className="text-5xl font-bold text-white brand-font tracking-wider drop-shadow-lg">
          {isZh ? '任务控制中心' : 'MISSION CONTROL'}
        </h2>
        <p className="text-slate-400 text-lg">
          {isZh ? '欢迎回来，指挥官。准备好执行下一个任务了吗？' : 'Welcome back, Commander. Ready for your next assignment?'}
        </p>
      </div>

      {/* Difficulty Selector Slider (Soft Glass) */}
      <div className="soft-glass rounded-3xl p-8 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
             <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {isZh ? '安全许可等级' : 'Security Clearance'}
            </h3>
            <span className={`text-2xl font-bold brand-font px-4 py-1 rounded-full bg-slate-800/50 border border-slate-700 ${profile.difficulty >= 8 ? 'text-rose-400' : profile.difficulty >= 5 ? 'text-blue-400' : 'text-emerald-400'}`}>
                Lv.{profile.difficulty} {getRankTitle(profile.difficulty, language === 'zh' ? 'zh' : 'en')}
            </span>
        </div>
       
        <div className="relative py-2">
            <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={profile.difficulty}
                onChange={(e) => onUpdateDifficulty(Number(e.target.value))}
                className="w-full h-4 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-3 font-mono px-1">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <span key={n} className={`transition-all ${profile.difficulty === n ? 'text-blue-400 font-bold scale-125' : ''}`}>{n}</span>
                ))}
            </div>
        </div>

        <div className="mt-6 text-center">
             <span className="inline-block bg-blue-900/20 text-blue-200 border border-blue-500/20 px-6 py-2 rounded-xl text-sm font-medium">
                {getRankDescription(profile.difficulty, language === 'zh' ? 'zh' : 'en')}
            </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
        {[
            { label: isZh ? '等级' : 'Level', val: profile.level, color: 'text-blue-400' },
            { label: isZh ? '经验值' : 'XP Points', val: profile.xp, color: 'text-purple-400' },
            { label: isZh ? '连胜' : 'Streak', val: profile.streak, color: 'text-emerald-400', unit: isZh ? '天' : 'Days' }
        ].map((stat, i) => (
            <div key={i} className="soft-card p-5 text-center flex flex-col items-center justify-center hover:bg-slate-800/50 transition-colors">
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">{stat.label}</div>
                <div className={`text-3xl font-bold brand-font ${stat.color}`}>{stat.val} {stat.unit && <span className="text-sm text-slate-600 ml-1">{stat.unit}</span>}</div>
            </div>
        ))}
      </div>

      {/* Mission Selection Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {missions.map((m) => (
            <div 
                key={m.view}
                onClick={() => onChangeView(m.view)}
                className={`
                    group relative bg-gradient-to-br ${m.colorClass} 
                    border p-6 rounded-3xl cursor-pointer 
                    shadow-lg hover:shadow-xl hover:-translate-y-1 hover:brightness-110
                    transition-all duration-300 backdrop-blur-sm
                `}
            >
                <div className={`
                    w-12 h-12 rounded-2xl ${m.iconColor} 
                    flex items-center justify-center text-2xl shadow-inner mb-4
                    group-hover:scale-110 transition-transform
                `}>
                    {m.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-1 brand-font tracking-wide group-hover:text-white">
                    {m.title}
                </h3>
                <p className="text-slate-400 text-sm font-medium">
                    {m.desc}
                </p>
                
                {/* Decorative glow */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none`}></div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default MissionControl;