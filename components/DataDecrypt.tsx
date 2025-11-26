import React, { useState, useEffect } from 'react';
import { generateReadingExercise, generateWordImage } from '../services/geminiService';
import { ReadingExercise, Language, DifficultyLevel } from '../types';
import Button from './ui/Button';
import AudioButton from './ui/AudioButton';

interface Props {
  onComplete: (xp: number) => void;
  onBack: () => void;
  language: Language;
  difficulty: DifficultyLevel;
}

const DataDecrypt: React.FC<Props> = ({ onComplete, onBack, language, difficulty }) => {
  const [data, setData] = useState<ReadingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const isZh = language === 'zh';

  const loadMission = async () => {
    setLoading(true);
    setAnswers({});
    setIsSubmitted(false);
    setShowTranslation(false);
    setImage(null);
    try {
      const res = await generateReadingExercise(difficulty);
      setData(res);
      if (res.imagePrompt) {
          generateWordImage(res.imagePrompt).then(setImage);
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

  const handleSelect = (qIndex: number, optIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
        <p className="text-rose-300 animate-pulse font-medium">
          {isZh ? '加载文章...' : 'Loading Text...'}
        </p>
      </div>
    );
  }

  if (!data) return null;

  let correctCount = 0;
  if (isSubmitted) {
      data.questions.forEach((q, i) => {
          if (answers[i] === q.correctIndex) correctCount++;
      });
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-8">
      
      {/* Reading Text Panel (Left) */}
      <div className="md:w-1/2 flex flex-col h-full soft-glass rounded-[2rem] overflow-hidden shadow-xl border-0">
         
         {/* Image Header */}
         <div className="h-56 w-full bg-slate-900 relative shrink-0">
             {image ? (
                 <>
                    <img src={image} alt="Header" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                 </>
             ) : (
                 <div className="w-full h-full flex items-center justify-center bg-slate-800">
                     <span className="text-4xl opacity-20">📖</span>
                 </div>
             )}
             
             <div className="absolute top-4 left-4">
                 <button onClick={onBack} className="bg-black/40 hover:bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md transition-all font-bold">
                    ← {isZh ? '退出' : 'Exit'}
                 </button>
             </div>
         </div>

         <div className="p-8 flex-1 overflow-y-auto custom-scrollbar relative bg-slate-900/40">
             <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-slate-100 brand-font">
                    {data.title}
                </h2>
                <div className="flex items-center gap-3">
                    <AudioButton text={data.passage} />
                    <button 
                        onClick={() => setShowTranslation(!showTranslation)} 
                        className="text-rose-300 hover:text-white text-xs uppercase font-bold border border-rose-500/30 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 transition-all"
                    >
                        {showTranslation ? (isZh ? '隐藏' : 'Hide') : (isZh ? '翻译' : 'Translate')}
                    </button>
                </div>
             </div>
             
             <div className="prose prose-invert prose-p:text-slate-200 prose-p:leading-loose prose-p:text-xl max-w-none">
                 <p className="animate-fade-in-up font-medium tracking-wide">{data.passage}</p>
                 {showTranslation && data.passageCn && (
                     <div className="mt-8 pt-8 border-t border-white/10 animate-fade-in-up">
                         <p className="text-slate-400 text-lg leading-relaxed">{data.passageCn}</p>
                     </div>
                 )}
             </div>
         </div>
      </div>

      {/* Questions Panel (Right) */}
      <div className="md:w-1/2 flex flex-col h-full overflow-y-auto custom-scrollbar">
         <div className="bg-slate-800/40 border border-slate-700/30 rounded-[2rem] p-8 space-y-8 backdrop-blur-sm">
            <h3 className="text-rose-300 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <span className="text-xl">🧐</span>
                {isZh ? '理解测试' : 'Comprehension Check'}
            </h3>
            
            {data.questions.map((q, qIndex) => (
                <div key={qIndex} className="space-y-4 bg-slate-900/30 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start gap-4">
                        <p className="text-slate-100 font-bold text-lg">{q.question}</p>
                        <AudioButton text={q.question} size="sm" />
                    </div>
                    {isZh && q.questionCn && <p className="text-slate-500 text-sm">{q.questionCn}</p>}
                    
                    <div className="space-y-3 mt-4">
                        {q.options.map((opt, optIndex) => {
                            let statusClass = "border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700";
                            
                            if (answers[qIndex] === optIndex) {
                                statusClass = "border-rose-500/50 bg-rose-500/10 text-rose-200";
                            }

                            if (isSubmitted) {
                                if (optIndex === q.correctIndex) {
                                    statusClass = "border-emerald-500 bg-emerald-500/20 text-emerald-300";
                                } else if (answers[qIndex] === optIndex) {
                                    statusClass = "border-red-500 bg-red-500/20 text-red-300";
                                }
                            }

                            return (
                                <button
                                    key={optIndex}
                                    onClick={() => handleSelect(qIndex, optIndex)}
                                    disabled={isSubmitted}
                                    className={`w-full text-left p-4 rounded-xl border text-base font-medium transition-all ${statusClass}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0
                                            ${answers[qIndex] === optIndex ? 'border-rose-400 text-rose-400' : 'border-slate-500 text-slate-500'}
                                            ${isSubmitted && optIndex === q.correctIndex ? '!border-emerald-400 !text-emerald-400' : ''}
                                        `}>
                                            {String.fromCharCode(65 + optIndex)}
                                        </div>
                                        <span>{opt}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div className="pt-6">
                {!isSubmitted ? (
                    <Button onClick={handleSubmit} fullWidth className="py-4 text-lg rounded-xl !bg-rose-600 hover:!bg-rose-500 shadow-xl shadow-rose-900/20">
                        {isZh ? '提交答案' : 'Submit Answers'}
                    </Button>
                ) : (
                    <div className="text-center animate-fade-in-up bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                         <p className="mb-4 text-slate-300 font-bold text-xl">
                             {isZh ? '正确率' : 'Score'}: <span className={correctCount === data.questions.length ? "text-emerald-400" : "text-amber-400"}>{correctCount}/{data.questions.length}</span>
                         </p>
                        <Button onClick={() => { onComplete(correctCount * 15); loadMission(); }} variant="secondary" fullWidth className="py-3 rounded-xl">
                            {isZh ? '下一篇' : 'Next Passage'}
                        </Button>
                    </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default DataDecrypt;