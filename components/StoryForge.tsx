import React, { useState, useEffect, useRef } from 'react';
import { continueStory, generateWordImage } from '../services/geminiService';
import { StorySegment, Language, DifficultyLevel } from '../types';
import Button from './ui/Button';
import AudioButton from './ui/AudioButton';

interface Props {
  onComplete: (xp: number) => void;
  onBack: () => void;
  language: Language;
  difficulty: DifficultyLevel;
}

const StoryForge: React.FC<Props> = ({ onComplete, onBack, language, difficulty }) => {
  const [history, setHistory] = useState<StorySegment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const isZh = language === 'zh';

  const startStory = async () => {
    setStarted(true);
    setLoading(true);
    const initialPrompt = "Start a sci-fi mystery story where the main character finds a strange glowing device.";
    const result = await continueStory([], initialPrompt, language, difficulty);
    setHistory([result]);
    setCurrentSegment(result);
    generateWordImage(result.imagePrompt || "sci-fi mystery").then(img => {
        if(img) setStoryImage(img);
    });
    setLoading(false);
  };

  const handleChoice = async (choice: string) => {
    setLoading(true);
    const historyText = history.map(h => h.text);
    const userChoiceSegment: StorySegment = { text: `User chose: ${choice}`, options: [] };
    const newHistory = [...historyText, `User chose: ${choice}`];
    
    const result = await continueStory(newHistory, choice, language, difficulty);
    
    setHistory(prev => [...prev, userChoiceSegment, result]);
    setCurrentSegment(result);
    
    generateWordImage(result.imagePrompt || "sci-fi adventure").then(img => {
         if(img) setStoryImage(img);
    });

    setLoading(false);
  };

  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, currentSegment]);

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8">
        <div className="w-24 h-24 bg-purple-500 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-purple-900/30">
            📚
        </div>
        <div>
            <h2 className="text-4xl font-bold text-white brand-font mb-2">{isZh ? '故事熔炉' : 'Story Forge'}</h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
            {isZh 
                ? '你是主角。AI 会根据你的决定生成周围的世界。' 
                : 'You are the hero. The story adapts to your choices.'}
            </p>
        </div>
        
        <div className="flex gap-4">
             <Button onClick={onBack} variant="ghost" className="rounded-xl">{isZh ? '返回' : 'Back'}</Button>
             <Button onClick={startStory} variant="secondary" className="px-8 py-4 text-lg rounded-xl shadow-lg">{isZh ? '开始故事' : 'Start Story'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
       <div className="flex justify-between items-center mb-6 shrink-0">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-2">
           ← {isZh ? '退出' : 'Exit'}
        </button>
         <div className="flex items-center gap-4">
             {isZh && (
                <button 
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="text-sm font-medium text-purple-300 hover:text-white"
                >
                  {showTranslation ? 'Hide' : '翻译'}
                </button>
             )}
             <div className="bg-purple-900/20 px-4 py-1.5 rounded-full border border-purple-500/20 text-xs font-bold text-purple-300 tracking-wide">
                 Lv.{difficulty}
             </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar pb-8">
         {/* Past segments */}
         {history.slice(0, -1).map((segment, i) => {
             if (segment.text.startsWith("User chose:")) return null;
             return (
                 <div key={i} className="text-slate-500 text-base p-6 border-l-4 border-slate-700/50 bg-slate-900/20 rounded-r-2xl">
                     <p className="leading-relaxed">{segment.text}</p>
                 </div>
             );
         })}

         {/* Current Segment */}
         {currentSegment && (
             <div className="soft-glass rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in-up border-0">
                 {storyImage && (
                     <div className="h-64 w-full overflow-hidden relative">
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-80"></div>
                         <img src={storyImage} alt="Story scene" className="w-full h-full object-cover" />
                     </div>
                 )}
                 <div className="p-8 md:p-10 relative">
                     {loading ? (
                        <div className="space-y-4">
                            <div className="h-4 bg-slate-700/50 rounded-full animate-pulse w-3/4"></div>
                            <div className="h-4 bg-slate-700/50 rounded-full animate-pulse w-full"></div>
                            <div className="h-4 bg-slate-700/50 rounded-full animate-pulse w-5/6"></div>
                        </div>
                     ) : (
                        <div>
                             <div className="flex justify-between items-start gap-6">
                                <p className="text-xl md:text-2xl leading-relaxed text-slate-100 font-medium tracking-wide">{currentSegment.text}</p>
                                <AudioButton text={currentSegment.text} size="md" />
                             </div>
                            
                            {showTranslation && currentSegment.textCn && (
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <p className="text-lg leading-relaxed text-purple-300/90 font-light">
                                        {currentSegment.textCn}
                                    </p>
                                </div>
                            )}
                        </div>
                     )}
                 </div>
             </div>
         )}
         <div ref={bottomRef}></div>
      </div>

      {/* Choices Area */}
      <div className="shrink-0 pt-6 pb-2 space-y-3">
        {loading ? (
            <div className="flex justify-center p-4">
                <span className="text-purple-300 animate-pulse font-medium">{isZh ? '正在生成...' : 'Generating...'}</span>
            </div>
        ) : (
            currentSegment?.options.map((option, idx) => (
                <button
                    key={idx}
                    onClick={() => handleChoice(option)}
                    className="w-full text-left p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-purple-900/20 hover:border-purple-500/30 transition-all text-slate-200 hover:text-white group relative overflow-hidden shadow-sm hover:shadow-md"
                >
                    <div className="flex items-center justify-between relative z-10">
                        <div className="text-lg font-medium pr-8">
                            {option}
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                             <AudioButton text={option} size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    {isZh && currentSegment.optionsCn && currentSegment.optionsCn[idx] && (
                        <div className="text-sm text-slate-500 mt-2 font-light">
                            {currentSegment.optionsCn[idx]}
                        </div>
                    )}
                </button>
            ))
        )}
      </div>
    </div>
  );
};

export default StoryForge;