import React, { useState } from 'react';
import { correctGrammar } from '../services/geminiService';
import { GrammarCorrection, Language, DifficultyLevel } from '../types';
import Button from './ui/Button';
import AudioButton from './ui/AudioButton';

interface Props {
  onComplete: (xp: number) => void;
  onBack: () => void;
  language: Language;
  difficulty: DifficultyLevel;
}

const CodeBreaker: React.FC<Props> = ({ onComplete, onBack, language, difficulty }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<GrammarCorrection | null>(null);
  const [loading, setLoading] = useState(false);
  
  const isZh = language === 'zh';

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    const data = await correctGrammar(input, language, difficulty);
    setResult(data);
    setLoading(false);
    
    if (data.score > 8) {
       // Success
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold transition-colors">
           ← {isZh ? '返回' : 'Back'}
        </button>
        <div className="flex items-center gap-3">
             <div className="bg-emerald-900/20 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Lv.{difficulty}
            </div>
            <h2 className="text-2xl font-bold text-emerald-400 brand-font">
            {isZh ? '代码破译' : 'Code Breaker'}
            </h2>
        </div>
      </div>

      <div className="soft-glass rounded-[2rem] p-8 relative overflow-hidden transition-all duration-300 shadow-xl border-0">
        
        <p className="text-slate-300 mb-6 text-lg">
          {isZh 
            ? '输入一个句子，我会帮你检查语法错误。' 
            : 'Enter a sentence below. I will check your grammar.'}
        </p>

        <textarea 
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none h-40 text-lg leading-relaxed shadow-inner"
          placeholder={isZh ? "在这里打字... (例如: 'I has a cat that fly spaceship.')" : "Type here... (e.g., 'I has a cat that fly spaceship.')"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !input}
            className="!bg-emerald-600 hover:!bg-emerald-500 shadow-lg shadow-emerald-900/30 rounded-xl px-8 py-3 text-lg"
          >
            {loading 
              ? (isZh ? '检查中...' : 'Checking...') 
              : (isZh ? '检查语法' : 'Check Grammar')}
          </Button>
        </div>
      </div>

      {result && (
        <div className="mt-8 animate-fade-in-up">
          <div className="bg-slate-800/80 border border-emerald-500/30 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl backdrop-blur-xl">
             
             <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-4">
                <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-3">
                   <span className="text-2xl">📝</span>
                   {isZh ? '反馈报告' : 'Feedback Report'}
                </h3>
                <div className={`
                    text-4xl font-bold brand-font
                    ${result.score >= 8 ? 'text-emerald-400' : result.score >= 5 ? 'text-amber-400' : 'text-rose-400'}
                `}>
                    {result.score}<span className="text-base text-slate-500 ml-1 font-normal">/10</span>
                </div>
             </div>

             <div className="space-y-8">
                <div>
                    <span className="text-xs uppercase text-slate-500 font-bold tracking-widest mb-3 block">
                      {isZh ? '正确写法' : 'Corrected Version'}
                    </span>
                    <div className="p-6 bg-slate-900/50 rounded-2xl border-l-4 border-emerald-500 text-2xl text-slate-100 font-medium flex justify-between items-center gap-4 shadow-sm">
                        <span>{result.corrected}</span>
                        <AudioButton text={result.corrected} size="md" className="shrink-0" />
                    </div>
                </div>
                
                <div className="bg-emerald-900/10 p-6 rounded-2xl border border-emerald-500/10 relative">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs uppercase text-emerald-400 font-bold tracking-widest flex items-center gap-2">
                           <span>💡</span> {isZh ? '解释' : 'Explanation'}
                        </span>
                        <AudioButton text={result.explanation} size="sm" />
                    </div>
                    <p className="text-slate-300 leading-loose text-lg">{result.explanation}</p>
                    {isZh && result.explanationCn && (
                        <p className="text-slate-400 mt-4 text-base border-t border-emerald-500/10 pt-3">{result.explanationCn}</p>
                    )}
                </div>
             </div>

             <div className="mt-8 flex justify-center">
                <Button onClick={() => { setInput(''); setResult(null); onComplete(10); }} variant="ghost" className="hover:bg-emerald-900/10 hover:text-emerald-400 rounded-xl px-8">
                    {isZh ? '下一个句子' : 'Next Sentence'}
                </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeBreaker;