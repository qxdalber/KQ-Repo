export type Language = 'en' | 'zh';

export type DifficultyLevel = number; // 1 to 10

export interface UserProfile {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  difficulty: DifficultyLevel;
}

export interface VocabularyWord {
  word: string;
  definition: string;
  definitionCn?: string;
  exampleSentence: string;
  exampleSentenceCn?: string;
  funFact: string;
  funFactCn?: string;
  difficulty: DifficultyLevel;
}

export interface StorySegment {
  text: string;
  textCn?: string;
  options: string[];
  optionsCn?: string[];
  imagePrompt?: string; // Prompt used to generate background
}

export interface GrammarCorrection {
  corrected: string;
  explanation: string;
  explanationCn?: string;
  score: number;
}

// New Types for new missions
export interface TenseExercise {
  sentence: string; // "Yesterday, I [BLANK] to the moon."
  sentenceCn?: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  explanationCn?: string;
  tenseType: string; // e.g., "Past Simple"
  imagePrompt?: string; // For generating a visual context
}

export interface ClozeExercise {
  text: string; // Full text with placeholders like ___1___
  textCn?: string;
  blanks: {
    id: number;
    correctWord: string;
    options: string[]; // Distractors + correct
  }[];
  imagePrompt?: string; // For generating a visual context
}

export interface ReadingExercise {
  title: string;
  passage: string;
  passageCn?: string;
  questions: {
    question: string;
    questionCn?: string;
    options: string[];
    correctIndex: number;
  }[];
  imagePrompt?: string; // For generating a visual context
}

export interface ListeningExercise {
  audioScript: string; // The text to be spoken (hidden from user initially)
  question: string; // "What color was the alien's ship?"
  questionCn?: string;
  options: string[];
  correctIndex: number;
  imagePrompt?: string;
}

export interface SpeakingExercise {
  phrase: string; // The target phrase to speak
  phraseCn?: string;
  context: string; // "You are commanding the ship to launch."
  keywords: string[]; // Words that must be detected
  imagePrompt?: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  WORD_WARP = 'WORD_WARP', // Vocab
  STORY_FORGE = 'STORY_FORGE', // Story/Reading
  CODE_BREAKER = 'CODE_BREAKER', // Grammar/Writing
  CHRONO_QUEST = 'CHRONO_QUEST', // Tenses
  ECHO_CHAMBER = 'ECHO_CHAMBER', // Cloze
  DATA_DECRYPT = 'DATA_DECRYPT',  // Reading
  SONIC_CIPHER = 'SONIC_CIPHER', // Listening
  ECHO_PILOT = 'ECHO_PILOT' // Speaking
}