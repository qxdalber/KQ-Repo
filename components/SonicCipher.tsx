import React, { useState, useEffect } from 'react';
import { generateListeningExercise, generateWordImage } from '../services/geminiService';
import { ListeningExercise, Language, DifficultyLevel } from '../types';
import Button from './ui/Button';
import AudioButton from './ui/AudioButton';

interface Props {
  onComplete: (xp: number) => void;
  onBack: () => void;
  language: Language;
  difficulty: DifficultyLevel;
}

const SonicCipher: React.FC<Props> = ({ onComplete, onBack, language, difficulty }) => {
  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [revealedScript, setRevealedScript] = useState(false);

  const isZh = language === 'zh';

  const loadMission = async () => {
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);
    setRevealedScript(false);
    setImage(null);
    try {
      const data = await generateListeningExercise(difficulty);
      setExercise(data);
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

  const handleCheck = (index: number) => {
    if (!exercise || selected !== null) return;
    setSelected(index);
    const correct = index === exercise.correctIndex;
    setIsCorrect(correct);
    if (correct) {
        setRevealedScript(true);
    }
  };

  const handleNext = () => {
     if (isCorrect) {
         onComplete(25);
     } else {
         loadMission();
     }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="flex space-x-2">
            <div className="w-3 h-12 bg-indigo-500 rounded animate-[soundWave_1s_ease-in-out_infinite]"></div>
            <div className="w-3 h-12 bg-indigo-500 rounded animate-[soundWave_1s_ease-in-out_0.2s_infinite]"></div>
            <div className="w-3 h-12 bg-indigo-500 rounded animate-[soundWave_1s_ease-in-out_0.4s_infinite]"></div>
        </div>
        <p className="text-indigo-300 animate-pulse font-mono tracking-widest">
          {isZh ? '正在接收加密音频...' : 'RECEIVING ENCRYPTED AUDIO...'}
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
        <div className="bg-indigo-900/30 px-3 py-1 rounded-lg border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase">
             {isZh ? '听力模块' : 'Listening Module'}
        </div>
      </div>

      <div className="bg-gray-800/80 border border-indigo-500/50 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)]">
        
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-6 brand-font text-center">
            {isZh ? '声波密码' : 'SONIC CIPHER'}
        </h2>

        {/* Visual Context */}
        <div className="mb-8 relative h-40 bg-black/40 rounded-xl overflow-hidden border border-indigo-900/50 flex items-center justify-center">
             {image ? (
                 <img src={image} alt="Context" className="w-full h-full object-cover opacity-60" />
             ) : (
                 <div className="text-indigo-900/40 text-6xl">♫</div>
             )}
             <div className="absolute inset-0 flex items-center justify-center z-10">
                 {/* Big Play Button for the Script */}
                 <div className="scale-150">
                     <AudioButton text={exercise.audioScript} size="lg" autoPlay={true} className="!bg-indigo-600 !border-indigo-400" />
                 </div>
             </div>
             <p className="absolute bottom-2 text-xs text-indigo-300 bg-black/50 px-2 rounded">
                 {isZh ? '点击播放音频' : 'Tap to Play Transmission'}
             </p>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
            <h3 className="text-xl text-white font-bold mb-2">{exercise.question}</h3>
            {isZh && exercise.questionCn && <p className="text-gray-500 text-sm">{exercise.questionCn}</p>}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3 mb-6">
            {exercise.options.map((option, idx) => {
                let statusClass = "bg-gray-700/50 border-gray-600 hover:bg-gray-600";
                if (selected === idx) {
                    if (idx === exercise.correctIndex) {
                         statusClass = "bg-green-600/20 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                    } else {
                         statusClass = "bg-red-600/20 border-red-500 text-red-300";
                    }
                } else if (selected !== null && idx === exercise.correctIndex) {
                     statusClass = "bg-green-600/20 border-green-500 text-green-300";
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleCheck(idx)}
                        disabled={selected !== null}
                        className={`p-4 rounded-xl border text-left font-medium transition-all ${statusClass}`}
                    >
                        <span className="opacity-50 mr-3 text-sm font-bold">0{idx + 1}</span>
                        {option}
                    </button>
                );
            })}
        </div>

        {/* Reveal Script after Correct Answer */}
        {revealedScript && (
            <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/20 animate-fade-in-up mb-6">
                <span className="text-xs text-indigo-400 font-bold uppercase mb-1 block">{isZh ? '解密文本' : 'Decrypted Transcript'}</span>
                <p className="text-indigo-100 italic">"{exercise.audioScript}"</p>
            </div>
        )}

        {selected !== null && (
            <div className="animate-fade-in-up">
                 <Button onClick={handleNext} fullWidth variant={isCorrect ? 'primary' : 'secondary'}>
                    {isCorrect ? (isZh ? '任务完成' : 'Mission Complete') : (isZh ? '重试' : 'Retry Protocol')}
                 </Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default SonicCipher;