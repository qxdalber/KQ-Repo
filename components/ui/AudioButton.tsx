import React, { useState, useEffect } from 'react';
import { playText, stopAudio } from '../../services/audioService';
import { Language } from '../../types';

interface AudioButtonProps {
  text: string;
  language?: Language; // 'en' or 'zh'
  label?: string; // Optional text label next to icon
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  autoPlay?: boolean;
}

const AudioButton: React.FC<AudioButtonProps> = ({ 
  text, 
  language = 'en', 
  label, 
  size = 'md',
  className = '',
  autoPlay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (autoPlay && text) {
        handlePlay();
    }
  }, [text, autoPlay]);

  const handlePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playText(text, language, () => setIsPlaying(false));
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-10 h-10 p-2',
    lg: 'w-14 h-14 p-3'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  return (
    <button 
      onClick={handlePlay}
      className={`
        relative rounded-full flex items-center justify-center transition-all duration-300
        ${isPlaying 
            ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] border-blue-400' 
            : 'bg-gray-700/50 hover:bg-blue-600/80 border-gray-500 hover:border-blue-400'}
        border ${sizeClasses[size]} ${className}
      `}
      aria-label="Play Audio"
      title="Listen"
    >
      {isPlaying ? (
        <div className="flex items-end justify-center gap-[2px] w-full h-full pb-1">
           <div className="w-1 bg-white rounded-full sound-bar h-[40%]"></div>
           <div className="w-1 bg-white rounded-full sound-bar h-[70%]"></div>
           <div className="w-1 bg-white rounded-full sound-bar h-[50%]"></div>
           <div className="w-1 bg-white rounded-full sound-bar h-[30%]"></div>
        </div>
      ) : (
        <svg className={`${iconSizes[size]} text-white`} fill="currentColor" viewBox="0 0 24 24">
           <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 0h-2.5l-5 5v5h5l5 5v-15z"/>
        </svg>
      )}
      {label && <span className="ml-2 text-sm text-gray-300">{label}</span>}
    </button>
  );
};

export default AudioButton;