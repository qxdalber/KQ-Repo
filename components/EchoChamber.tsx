import React, { useState, useEffect } from 'react';
import { generateClozeExercise, generateWordImage } from '../services/geminiService';
import { ClozeExercise, Language, DifficultyLevel } from '../types';
import Button from './ui/Button';
import AudioButton from './ui/AudioButton';

interface Props {
  onComplete: (xp: number) => void;
  onBack: () => void;
  language: Language;
  difficulty: DifficultyLevel;
}

const EchoChamber: React.FC<Props> = ({ onComplete, onBack, language, difficulty }) => {
  const [mission, setMission] = useState<ClozeExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const isZh = language === 'zh';

  const loadMission = async () => {
    setLoading(true);
    setIsSubmitted(false);
    setUserAnswers({});
    setImage(null);
    try {
      const data = await generateClozeExercise(difficulty);
      setMission(data);
      if (data.imagePrompt) {
          generateWordImage(data.imagePrompt).then(setImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMission();
  }, [difficulty]);

  const handleSelect = (blankId: number, word: string) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [blankId]: word }));
  };

  const checkAnswers = () => {
    setIsSubmitted(true);
  };

  const getScore = () => {
    if (!mission) return 0;
    let correct = 0;
    mission.blanks.forEach(b => {
        if (userAnswers[b.id] === b.correctWord) correct++;
    });
    return correct;
  };

  // Helper to reconstruct the full text for audio
  const getFullText = () => {
      if(!mission) return "";
      let text = mission.text;
      mission.blanks.forEach(b => {
          text = text.replace(`___${b.id}___`, b.correctWord);
      });
      return text;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center animate-pulse border border-cyan-500">
             <span className="text-2xl">0101</span>
        </div>
        <p className="text-cyan-300 font-mono">
          {isZh ? '正在重建数据日志...' : 'Reconstructing Data Logs...'}
        </p>
      </div>
    );
  }

  if (!mission) return null;

  const score = getScore();
  const total = mission.blanks.length;

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Visual Column */}
      <div className="md:w-1/3 space-y-4 order-2 md:order-1">
         <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 md:hidden">
           ← {isZh ? '中止' : 'Abort'}
        </button>
        
        <div className="bg-gray-800 border border-cyan-600 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="h-48 w-full bg-black relative">
                 {image ? (
                     <img src={image} alt="Log Visual" className="w-full h-full object-cover opacity-80" />
                 ) : (
                     <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                         <div className="text-cyan-900 text-6xl opacity-20 font-bold">?</div>
                     </div>
                 )}
                 {/* Scanline overlay */}
                 <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                 <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-cyan-400 border border-cyan-500/30">
                     LOG_VISUAL_001
                 </div>
            </div>
            <div className="p-4">
                 <h3 className="text-cyan-400 font-bold brand-font mb-2">{isZh ? '任务简报' : 'Mission Brief'}</h3>
                 <p className="text-gray-400 text-xs leading-relaxed">
                     {isZh 
                       ? '从受损的服务器中恢复了部分数据片段。我们需要你填补缺失的语法链接以恢复文件的完整性。' 
                       : 'Fragmented data recovered from damaged sector. We need you to bridge the missing syntax links to restore file integrity.'}
                 </p>
            </div>
        </div>
      </div>

      {/* Interactive Column */}
      <div className="md:w-2/3 order-1 md:order-2">
        <div className="flex justify-between items-center mb-6 hidden md:flex">
            <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
            ← {isZh ? '中止' : 'Abort'}
            </button>
            <div className="bg-cyan-900/30 px-3 py-1 rounded text-cyan-400 text-xs tracking-widest uppercase animate-pulse">
                {isZh ? '数据恢复模式' : 'Data Recovery Mode'}
            </div>
        </div>

        <div className="bg-gray-900/80 border border-cyan-500/50 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-20 blur-sm -z-10"></div>
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-400 brand-font animate-glitch inline-block">
                    {isZh ? '损坏的日志文件' : 'CORRUPTED LOG FILE'}
                </h2>
                {/* Allow playing the reconstructed text if submitted, or the broken text (less useful but still) */}
                {isSubmitted && <AudioButton text={getFullText()} label="Play Log" />}
            </div>

            <div className="bg-black/60 font-mono text-green-400 p-6 rounded-lg border border-gray-700 leading-loose shadow-inner mb-8">
                {mission.text.split(/(___\d___)/g).map((part, i) => {
                    const match = part.match(/___(\d)___/);
                    if (match) {
                        const id = parseInt(match[1]);
                        const answer = userAnswers[id];
                        const isCorrect = mission.blanks.find(b => b.id === id)?.correctWord === answer;
                        
                        return (
                            <span key={i} className={`inline-block min-w-[80px] text-center border-b-2 mx-1 px-2 transition-all duration-300 ${
                                isSubmitted 
                                    ? (isCorrect ? 'border-green-500 text-green-300 bg-green-900/20' : 'border-red-500 text-red-300 bg-red-900/20') 
                                    : (answer ? 'border-cyan-400 text-cyan-300 bg-cyan-900/20' : 'border-gray-500 text-gray-500 animate-pulse')
                            }`}>
                                {answer || '____'}
                            </span>
                        );
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
                {mission.blanks.map((blank) => (
                    <div key={blank.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors">
                        <span className="text-xs text-cyan-500 uppercase font-bold mb-3 block">
                            {isZh ? `插槽 #${blank.id} 选项` : `Slot #${blank.id} Options`}
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {blank.options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => handleSelect(blank.id, opt)}
                                    disabled={isSubmitted}
                                    className={`
                                        py-2 px-4 rounded-lg text-sm font-bold transition-all transform active:scale-95
                                        ${userAnswers[blank.id] === opt 
                                            ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)] scale-105' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}
                                    `}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {!isSubmitted ? (
                <Button onClick={checkAnswers} fullWidth className="!bg-cyan-600 hover:!bg-cyan-500">
                    {isZh ? '验证数据完整性' : 'Verify Data Integrity'}
                </Button>
            ) : (
                <div className="text-center animate-fade-in-up bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <p className="text-xl font-bold text-white mb-2">
                        {isZh ? '恢复率: ' : 'Recovery Rate: '} 
                        <span className={score === total ? 'text-green-400' : 'text-yellow-400'}>
                            {Math.round((score/total)*100)}%
                        </span>
                    </p>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-6">
                         <div 
                            className={`h-full ${score === total ? 'bg-green-500' : 'bg-yellow-500'} transition-all duration-1000`} 
                            style={{ width: `${(score/total)*100}%` }}
                        ></div>
                    </div>
                    <Button onClick={() => { onComplete(score * 10); loadMission(); }} variant="secondary" className="!w-auto px-8">
                        {isZh ? '下一个日志' : 'Next Log'}
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EchoChamber;