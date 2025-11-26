import React, { useState, useEffect } from 'react';
import { fetchDailyWords, generateWordImage } from '../services/geminiService';
import { VocabularyWord, Language, DifficultyLevel } from '../types';
import Button from './ui/Button';
import AudioButton from './ui/AudioButton';

interface Props {
  onComplete: (xp: number) => void;
  onBack: () => void;
  language: Language;
  difficulty: DifficultyLevel;
}

const WordWarp: React.FC<Props> = ({ onComplete, onBack, language, difficulty }) => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingImg, setGeneratingImg] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [topic, setTopic] = useState("Space");
  
  const isZh = language === 'zh';

  const loadWords = async (selectedTopic: string) => {
    setLoading(true);
    const data = await fetchDailyWords(selectedTopic, language, difficulty);
    setWords(data);
    setLoading(false);
    setCurrentIndex(0);
    setCurrentImage(null);
  };

  useEffect(() => {
    loadWords(topic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, difficulty]);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentImage(null);
    } else {
      onComplete(50);
    }
  };

  const handleVisualize = async () => {
    if (!words[currentIndex]) return;
    setGeneratingImg(true);
    const imgData = await generateWordImage(words[currentIndex].word);
    setCurrentImage(imgData);
    setGeneratingImg(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-blue-300 font-medium animate-pulse">
          {isZh ? '正在加载词汇库...' : 'Loading Lexicon...'}
        </p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center p-10 soft-glass rounded-3xl">
        <p className="text-rose-300 mb-6 font-bold">{isZh ? '加载失败。' : 'Failed to load.'}</p>
        <Button onClick={() => loadWords(topic)}>{isZh ? '重试' : 'Retry'}</Button>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6 px-2">
        <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold transition-colors">
           ← {isZh ? '返回' : 'Back'}
        </button>
        <div className="text-sm font-bold text-blue-300 bg-blue-900/30 px-4 py-1.5 rounded-full border border-blue-500/20">
          {isZh ? '单词' : 'Word'} {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div className="soft-glass rounded-[2rem] p-8 md:p-10 relative overflow-hidden transition-all duration-500">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Difficulty Badge */}
        <div className="absolute top-6 right-6">
          <span className={`
            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            ${difficulty >= 8 ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 
              difficulty >= 5 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 
              'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}
          `}>
            Lv.{difficulty}
          </span>
        </div>

        <div className="text-center mb-10 mt-2">
          <div className="flex items-center justify-center gap-4 mb-4">
             <h2 className="text-6xl font-bold text-white brand-font tracking-tight drop-shadow-lg">{currentWord.word}</h2>
             <AudioButton text={currentWord.word} size="lg" className="shadow-lg" />
          </div>
          <p className="text-2xl text-blue-200 font-serif leading-relaxed">"{currentWord.definition}"</p>
          {isZh && currentWord.definitionCn && (
             <p className="text-lg text-slate-400 mt-2 font-light">{currentWord.definitionCn}</p>
          )}
        </div>

        {/* Visualizer Area */}
        <div className="mb-10 bg-slate-900/50 rounded-2xl overflow-hidden min-h-[240px] flex items-center justify-center border border-slate-700/50 shadow-inner group">
           {generatingImg ? (
             <div className="text-center p-6">
                <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-purple-300 text-sm font-medium">{isZh ? '正在绘制...' : 'Painting...'}</p>
             </div>
           ) : currentImage ? (
             <img src={currentImage} alt={currentWord.word} className="w-full h-72 object-cover hover:scale-105 transition-transform duration-700" />
           ) : (
             <div className="text-center p-8">
               <p className="text-slate-500 mb-4 text-sm font-medium">{isZh ? '暂无图片' : 'No visual data.'}</p>
               <Button onClick={handleVisualize} variant="secondary" className="text-sm shadow-lg">
                 {isZh ? '生成图片' : 'Generate Image'}
               </Button>
             </div>
           )}
        </div>

        <div className="space-y-6 mb-10">
          <div className="bg-blue-900/10 p-6 rounded-2xl border border-blue-500/10 relative hover:bg-blue-900/20 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-blue-300 font-bold text-xs uppercase tracking-widest">{isZh ? '例句' : 'Example'}</h4>
                <AudioButton text={currentWord.exampleSentence} size="sm" />
            </div>
            <p className="text-slate-200 text-lg leading-relaxed">{currentWord.exampleSentence}</p>
            {isZh && currentWord.exampleSentenceCn && (
                <p className="text-slate-500 text-sm mt-2">{currentWord.exampleSentenceCn}</p>
            )}
          </div>
          
          <div className="bg-purple-900/10 p-6 rounded-2xl border border-purple-500/10 relative hover:bg-purple-900/20 transition-colors">
             <div className="flex justify-between items-start mb-2">
                 <h4 className="text-purple-300 font-bold text-xs uppercase tracking-widest">{isZh ? '趣味小知识' : 'Fun Fact'}</h4>
                 <AudioButton text={currentWord.funFact} size="sm" />
             </div>
            <p className="text-slate-200 text-lg leading-relaxed">{currentWord.funFact}</p>
             {isZh && currentWord.funFactCn && (
                <p className="text-slate-500 text-sm mt-2">{currentWord.funFactCn}</p>
            )}
          </div>
        </div>

        <div className="pt-2">
            <Button onClick={handleNext} fullWidth className="py-4 text-lg shadow-xl shadow-blue-900/20">
            {currentIndex === words.length - 1 
                ? (isZh ? '完成' : 'Complete') 
                : (isZh ? '下一个' : 'Next Word')}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default WordWarp;