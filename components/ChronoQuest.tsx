import React, { useState, useEffect } from 'react';
import { generateTenseExercise, generateWordImage } from '../services/geminiService';
import { TenseExercise, Language, DifficultyLevel } from '../types';
import Button from './ui/Button';
import AudioButton from './ui/AudioButton';

interface Props {
  onComplete: (xp: number) => void;
  onBack: () => void;
  language: Language;
  difficulty: DifficultyLevel;
}

const ChronoQuest: React.FC<Props> = ({ onComplete, onBack, language, difficulty }) => {
  const [exercise, setExercise] = useState<TenseExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [image, setImage] = useState<string | null>(null);

  const isZh = language === 'zh';

  const loadMission = async () => {
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);
    setImage(null);
    try {
      const data = await generateTenseExercise(difficulty);
      setExercise(data);
      // Fetch image in background to not block UI
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

  const handleCheck = (option: string) => {
    if (!exercise) return;
    setSelected(option);
    const correct = option === exercise.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
     if (streak >= 3) {
         onComplete(30); // Award XP after 3 correct
     } else {
         loadMission();
     }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-amber-500 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-2 border-4 border-amber-300 rounded-full animate-spin border-b-transparent reverse-spin"></div>
        </div>
        <p className="text-amber-300 animate-pulse font-mono tracking-widest">
          {isZh ? '正在校准时间驱动器...' : 'CALIBRATING TEMPORAL DRIVE...'}
        </p>
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">
           ← {isZh ? '中止' : 'Abort'}
        </button>
        <div className="text-amber-400 font-bold tracking-widest uppercase bg-amber-900/30 px-3 py-1 rounded-lg border border-amber-500/30">
            {isZh ? '连胜' : 'Streak'}: {streak}/3
        </div>
      </div>

      <div className="bg-gray-800/80 border border-amber-500/50 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)]">
        {/* Decorative Gear Background */}
        <div className="absolute -right-20 -top-20 w-64 h-64 border-[8px] border-amber-900/20 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute -left-20 -bottom-20 w-48 h-48 border-[6px] border-amber-900/20 rounded-full border-dashed animate-[spin_15s_linear_infinite_reverse]"></div>
        
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-6 brand-font relative z-10 flex items-center gap-2">
            <span className="text-2xl">⏳</span>
            {isZh ? '时间异常检测' : 'TEMPORAL ANOMALY DETECTED'}
        </h2>

        {/* Visual Context Window */}
        <div className="mb-6 relative rounded-xl overflow-hidden h-48 bg-black/50 border border-amber-700/50 flex items-center justify-center group">
            {image ? (
                <img src={image} alt="Context" className="w-full h-full object-cover animate-fade-in-up transition-transform duration-700 group-hover:scale-110" />
            ) : (
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-xs text-amber-500 uppercase tracking-widest">{isZh ? '正在渲染时间线...' : 'Rendering Timeline...'}</span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-2 left-4 text-xs text-amber-300/80 font-mono">
                {isZh ? '位置: 未知时代' : 'LOC: UNKNOWN ERA'}
            </div>
        </div>

        <div className="bg-black/40 p-6 rounded-xl border border-amber-900/50 mb-8 relative z-10 shadow-inner">
             {/* Only play audio if we have the full sentence (e.g., after completion) or constructing it loosely */}
            <div className="absolute top-2 right-2">
                 <AudioButton text={exercise.sentence.replace('[BLANK]', 'blank')} size="sm" />
            </div>

            <p className="text-2xl text-center text-gray-200 leading-relaxed font-serif pt-4">
                {exercise.sentence.split('[BLANK]').map((part, i, arr) => (
                    <span key={i}>
                        {part}
                        {i < arr.length - 1 && (
                            <span className={`inline-block min-w-[100px] border-b-2 mx-2 text-center font-bold transition-all duration-300 ${
                                selected 
                                    ? (isCorrect ? 'text-green-400 border-green-500 bg-green-900/20' : 'text-red-400 border-red-500 bg-red-900/20')
                                    : 'text-amber-300 border-amber-500'
                            }`}>
                                {selected || '___'}
                            </span>
                        )}
                    </span>
                ))}
            </p>
            {isZh && exercise.sentenceCn && (
                 <p className="text-center text-gray-500 mt-4 text-sm italic">{exercise.sentenceCn}</p>
            )}
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
            {exercise.options.map((option) => (
                <button
                    key={option}
                    onClick={() => !selected && handleCheck(option)}
                    disabled={!!selected}
                    className={`
                        p-4 rounded-xl border-2 font-bold text-lg transition-all duration-300 relative overflow-hidden group
                        ${selected === option 
                            ? (isCorrect ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-red-600/20 border-red-500 text-red-400')
                            : (selected && option === exercise.correctAnswer ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-amber-400 hover:bg-gray-700 hover:text-white')
                        }
                    `}
                >
                    <span className="relative z-10">{option}</span>
                    {!selected && <div className="absolute inset-0 bg-amber-500/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
                </button>
            ))}
        </div>

        {selected && (
            <div className="mt-6 animate-fade-in-up relative z-10">
                <div className={`p-5 rounded-lg border ${isCorrect ? 'bg-green-900/30 border-green-500/50' : 'bg-red-900/30 border-red-500/50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                            {isCorrect ? '✓' : '✗'}
                        </div>
                        <h4 className={`font-bold text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? (isZh ? '时间线已稳定' : 'Timeline Stabilized') : (isZh ? '时间悖论警告' : 'Temporal Paradox Warning')}
                        </h4>
                    </div>
                    
                    <div className="flex items-start gap-2">
                        <p className="text-gray-300 pl-11 flex-1">{exercise.explanation}</p>
                        <AudioButton text={exercise.explanation} size="sm" />
                    </div>
                    
                    {isZh && exercise.explanationCn && (
                        <p className="text-gray-500 text-sm mt-2 pl-11">{exercise.explanationCn}</p>
                    )}
                </div>
                <div className="mt-6">
                    <Button onClick={handleNext} fullWidth variant={isCorrect ? 'primary' : 'secondary'}>
                        {streak >= 3 ? (isZh ? '完成' : 'Complete Mission') : (isZh ? '下一个异常' : 'Next Anomaly')}
                    </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChronoQuest;