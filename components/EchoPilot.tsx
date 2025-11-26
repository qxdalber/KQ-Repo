import React, { useState, useEffect, useRef } from 'react';
import { generateSpeakingExercise, generateWordImage } from '../services/geminiService';
import { SpeakingExercise, Language, DifficultyLevel } from '../types';
import Button from './ui/Button';
import AudioButton from './ui/AudioButton';

interface Props {
  onComplete: (xp: number) => void;
  onBack: () => void;
  language: Language;
  difficulty: DifficultyLevel;
}

const EchoPilot: React.FC<Props> = ({ onComplete, onBack, language, difficulty }) => {
  const [exercise, setExercise] = useState<SpeakingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null); // 0-100
  const [image, setImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isZh = language === 'zh';

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => setListening(true);
            recognition.onend = () => setListening(false);
            recognition.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                evaluateSpeech(text);
            };
            recognition.onerror = (event: any) => {
                setErrorMsg("Microphone error. Please allow permissions.");
                setListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            setErrorMsg("Your browser does not support Speech Recognition. Try Chrome.");
        }
    }
  }, [exercise]);

  const loadMission = async () => {
    setLoading(true);
    setTranscript('');
    setScore(null);
    setImage(null);
    setErrorMsg(null);
    try {
      const data = await generateSpeakingExercise(difficulty);
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

  const startListening = () => {
    if (recognitionRef.current) {
        setTranscript('');
        setScore(null);
        recognitionRef.current.start();
    }
  };

  const evaluateSpeech = (spokenText: string) => {
      if (!exercise) return;
      
      // Simple evaluation logic (Case insensitive inclusion check)
      const target = exercise.phrase.toLowerCase().replace(/[.,!]/g, '');
      const spoken = spokenText.toLowerCase().replace(/[.,!]/g, '');
      
      // Check keywords
      let hitCount = 0;
      const keywords = exercise.keywords.map(k => k.toLowerCase());
      keywords.forEach(k => {
          if (spoken.includes(k)) hitCount++;
      });

      let calculatedScore = 0;
      if (target === spoken) {
          calculatedScore = 100;
      } else {
          // Partial match based on keywords
          calculatedScore = Math.round((hitCount / keywords.length) * 80);
          if (spoken.length > 0 && calculatedScore < 20) calculatedScore = 20; // Pity points
      }
      
      setScore(calculatedScore);
  };

  const handleNext = () => {
      onComplete(30);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin"></div>
        <p className="text-fuchsia-300 animate-pulse font-mono tracking-widest">
          {isZh ? '正在初始化语音通讯...' : 'INITIALIZING COMMS...'}
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
        <div className="bg-fuchsia-900/30 px-3 py-1 rounded-lg border border-fuchsia-500/30 text-fuchsia-400 text-xs font-bold uppercase">
             {isZh ? '口语模块' : 'Speaking Module'}
        </div>
      </div>

      <div className="bg-gray-800/80 border border-fuchsia-500/50 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_rgba(217,70,239,0.2)]">
        
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400 mb-6 brand-font text-center">
            {isZh ? '回声领航' : 'ECHO PILOT'}
        </h2>

        {/* Visual Context */}
        <div className="flex gap-4 mb-6">
            <div className="w-1/3 bg-black/40 rounded-xl overflow-hidden border border-fuchsia-900/50">
                {image ? (
                    <img src={image} alt="Context" className="w-full h-full object-cover" />
                ) : (
                    <div className="h-full flex items-center justify-center text-fuchsia-900/40 text-4xl">?</div>
                )}
            </div>
            <div className="w-2/3 bg-gray-900/50 p-4 rounded-xl border border-gray-700 flex flex-col justify-center">
                <span className="text-xs text-fuchsia-500 uppercase font-bold mb-2">{isZh ? '任务情境' : 'Mission Context'}</span>
                <p className="text-gray-300 italic">{exercise.context}</p>
            </div>
        </div>

        {/* Target Phrase */}
        <div className="text-center mb-8 p-6 bg-black/30 rounded-2xl border border-fuchsia-500/30 relative">
             <div className="absolute top-2 right-2">
                 <AudioButton text={exercise.phrase} size="sm" />
             </div>
             <p className="text-3xl font-bold text-white tracking-wide mb-2">{exercise.phrase}</p>
             {isZh && exercise.phraseCn && <p className="text-gray-500 text-sm">{exercise.phraseCn}</p>}
        </div>

        {/* Interaction Area */}
        <div className="flex flex-col items-center justify-center space-y-6">
            
            {errorMsg ? (
                <div className="text-red-400 bg-red-900/20 p-4 rounded border border-red-500 text-sm">
                    {errorMsg}
                </div>
            ) : (
                <button
                    onClick={startListening}
                    disabled={listening}
                    className={`
                        w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                        ${listening 
                            ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse scale-110' 
                            : 'bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:scale-105'
                        }
                    `}
                >
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </button>
            )}

            <p className="text-sm text-gray-400 h-6">
                {listening ? (isZh ? '正在聆听...' : 'Listening...') : (transcript || (isZh ? '点击麦克风并朗读' : 'Tap mic and speak'))}
            </p>

            {score !== null && (
                <div className="w-full animate-fade-in-up">
                    <div className={`p-4 rounded-xl border text-center mb-4 ${
                        score > 60 ? 'bg-green-900/30 border-green-500/50' : 'bg-yellow-900/30 border-yellow-500/50'
                    }`}>
                        <div className="text-xs uppercase font-bold tracking-widest mb-1 text-gray-400">
                             {isZh ? '匹配准确率' : 'Match Accuracy'}
                        </div>
                        <div className={`text-4xl font-bold brand-font ${score > 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {score}%
                        </div>
                    </div>
                    <Button onClick={handleNext} fullWidth>
                        {score > 60 ? (isZh ? '任务完成' : 'Mission Complete') : (isZh ? '重试' : 'Retry')}
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EchoPilot;