import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyWord, GrammarCorrection, StorySegment, TenseExercise, ClozeExercise, ReadingExercise, ListeningExercise, SpeakingExercise, Language, DifficultyLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_TEXT = 'gemini-2.5-flash';
const MODEL_IMAGE = 'gemini-2.5-flash-image';

// STRICT Cambridge Super Minds Mapping
const getLevelPrompt = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case 1:
      return "Level: Cambridge Super Minds Starter (Pre-A1). UNIT THEMES: 'My Classroom', 'My Family', 'My Face', 'Toys', 'My House', 'On the Farm'. KEY VOCAB: Colors, Numbers 1-10, Family members, Face parts, Farm animals. GRAMMAR: Imperatives (Sit down), 'I have got', 'I like'.";
    case 2:
      return "Level: Cambridge Super Minds Level 1 (A1). UNIT THEMES: 'At School', 'Let's Play', 'Pet Show', 'Lunchtime', 'The Old House', 'Get Dressed', 'The Robot', 'At the Beach'. GRAMMAR: Present Continuous, 'There is/are', Prepositions (in, on, under), 'I can/can't'.";
    case 3:
      return "Level: Cambridge Super Minds Level 2 (A1+). UNIT THEMES: 'The Zoo', 'Where we live', 'The Market', 'My Bedroom', 'People in Town', 'In the Countryside'. GRAMMAR: Past Simple (was/were), Present Continuous for future, 'Some/Any', 'Would like', Question words.";
    case 4:
      return "Level: Cambridge Super Minds Level 3 (A2). UNIT THEMES: 'Daily Tasks', 'Around the World', 'Holiday Plans', 'The Weather', 'The Hospital', 'Ancient Egypt'. GRAMMAR: Past Simple (Regular/Irregular), Adverbs of frequency, Comparatives/Superlatives, 'Must/Must not'.";
    case 5:
      return "Level: Cambridge Super Minds Level 4 (A2+). UNIT THEMES: 'In the Museum', 'The World of Work', 'Safety First', 'The Orchestra', 'Space Travel', 'Camping'. GRAMMAR: 'Have to', Future 'Going to', Past Continuous, Relative Clauses (who/which), Possessive pronouns.";
    case 6:
      return "Level: Cambridge Super Minds Level 5 (B1). UNIT THEMES: 'Disaster!', 'In the Rainforest', 'The Rock 'n' Roll Show', 'Space Restaurant', 'The Wild West'. GRAMMAR: Present Perfect, Future 'Will', First Conditional, Tag Questions, 'Should/Might'.";
    case 7:
      return "Level: Cambridge Super Minds Level 6 (B1+). UNIT THEMES: 'The Pirates', 'Transport of the Future', 'Ancient History', 'Mythical Beasts', 'Space Explorers'. GRAMMAR: Passive Voice, Second Conditional, Reported Speech, Past Perfect, Third Conditional intro.";
    case 8:
      return "Level: CEFR B2 (Upper Intermediate). UNIT THEMES: 'Technology Ethics', 'Global Issues', 'Extreme Sports', 'Psychology'. GRAMMAR: Mixed Conditionals, Modals of Deduction, Inversion, Advanced Phrasal Verbs.";
    case 9:
      return "Level: CEFR B2+/C1. UNIT THEMES: 'Academic Science', 'Literature', 'Abstract Philosophy'. GRAMMAR: Cleft sentences, Subjunctive mood, Advanced cohesive devices.";
    case 10:
      return "Level: CEFR C2 (Mastery). Focus: Native-level nuance, idiomatic mastery, complex rhetoric.";
    default:
      return "Level: Cambridge Super Minds Level 3 (A2). Focus: General daily topics.";
  }
};

// --- Vocab Mission ---
export const fetchDailyWords = async (topic: string = 'Space Exploration', language: Language = 'en', difficulty: DifficultyLevel = 5): Promise<VocabularyWord[]> => {
  const levelContext = getLevelPrompt(difficulty);
  const prompt = `
    Generate 3 vocabulary words suitable for children based on this curriculum: ${levelContext}.
    Topic context: ${topic} (Adapt the topic to fit the Unit Themes listed in the curriculum).
    
    Return a JSON array where each object has:
    - word (string)
    - definition (string, simple definition matching the level)
    - definitionCn (string, Chinese translation)
    - exampleSentence (string, MUST use grammar from the level guide)
    - exampleSentenceCn (string, Chinese translation)
    - funFact (string, brief fun fact)
    - funFactCn (string, Chinese translation)
    - difficulty (number: ${difficulty})
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              definition: { type: Type.STRING },
              definitionCn: { type: Type.STRING },
              exampleSentence: { type: Type.STRING },
              exampleSentenceCn: { type: Type.STRING },
              funFact: { type: Type.STRING },
              funFactCn: { type: Type.STRING },
              difficulty: { type: Type.NUMBER }
            },
            required: ["word", "definition", "exampleSentence", "funFact", "difficulty"]
          }
        }
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text) as VocabularyWord[];
    }
    return [];
  } catch (error) {
    console.error("Error fetching words:", error);
    return [];
  }
};

export const generateWordImage = async (word: string): Promise<string | null> => {
  try {
    const prompt = `A kid-friendly, vibrant, 3D cartoon style illustration representing: "${word}". Sci-fi, adventure or fantasy art style. No text. High quality, colorful, suitable for a game.`;
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

// --- Grammar Mission ---
export const correctGrammar = async (sentence: string, language: Language = 'en', difficulty: DifficultyLevel = 5): Promise<GrammarCorrection> => {
  const levelContext = getLevelPrompt(difficulty);
  const prompt = `
    Act as a "Code Breaker" AI teaching English.
    Curriculum: ${levelContext}
    User Sentence: "${sentence}"
    
    1. Correct the grammar/syntax.
    2. Explain the error using concepts from the specified level (e.g. if Level 2, mention "Past Simple" or "Plurals").
    3. Provide Chinese translation for explanation.
    4. Score 1-10.
    
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            corrected: { type: Type.STRING },
            explanation: { type: Type.STRING },
            explanationCn: { type: Type.STRING },
            score: { type: Type.INTEGER }
          },
          required: ["corrected", "explanation", "score"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GrammarCorrection;
    }
    throw new Error("No response");
  } catch (error) {
    console.error("Error correcting grammar:", error);
    return { 
        corrected: sentence, 
        explanation: "System Error.", 
        explanationCn: "系统错误。",
        score: 0 
    };
  }
};

// --- Story Mission ---
export const continueStory = async (history: string[], choice: string, language: Language = 'en', difficulty: DifficultyLevel = 5): Promise<StorySegment> => {
  const levelContext = getLevelPrompt(difficulty);
  const prompt = `
    Write a sci-fi adventure story segment for a child.
    CURRICULUM CONSTRAINT: ${levelContext}
    
    Previous Context: ${JSON.stringify(history)}
    Action: "${choice}"
    
    Write 1 paragraph (40-60 words). Use vocabulary/grammar ONLY from the curriculum level provided.
    Provide Chinese translation.
    Provide 2 choices for the next step.
    Provide image prompt.
    
    Return JSON.
  `;

  try {
     const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            textCn: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            optionsCn: { type: Type.ARRAY, items: { type: Type.STRING } },
            imagePrompt: { type: Type.STRING }
          },
          required: ["text", "options", "imagePrompt"]
        }
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("Failed to generate story");
  } catch (error) {
    console.error("Error generating story:", error);
    return {
        text: "Signal Lost.",
        textCn: "信号丢失。",
        options: ["Retry"],
        optionsCn: ["重试"],
        imagePrompt: "static noise"
    };
  }
};

// --- Tense Exercise ---
export const generateTenseExercise = async (difficulty: DifficultyLevel = 5): Promise<TenseExercise> => {
    const levelContext = getLevelPrompt(difficulty);
    const prompt = `
      Create a Verb Tense exercise.
      CURRICULUM: ${levelContext}
      
      Create a sentence with a missing verb [BLANK]. The sentence context should fit the Unit Themes of the level.
      Provide 4 options.
      Provide explanation.
      Provide image prompt.
      
      Return JSON.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                sentence: { type: Type.STRING },
                sentenceCn: { type: Type.STRING },
                correctAnswer: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                explanation: { type: Type.STRING },
                explanationCn: { type: Type.STRING },
                tenseType: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
            },
            required: ["sentence", "correctAnswer", "options", "explanation", "tenseType", "imagePrompt"]
          }
        }
      });
      if (response.text) return JSON.parse(response.text);
      throw new Error("No data");
    } catch (e) { throw e; }
  };
  
  // --- Cloze Exercise ---
  export const generateClozeExercise = async (difficulty: DifficultyLevel = 5): Promise<ClozeExercise> => {
    const levelContext = getLevelPrompt(difficulty);
    const prompt = `
      Create a Fill-in-the-blanks (Cloze) text (40 words).
      CURRICULUM: ${levelContext}
      
      Select 3 words to blank out (vocabulary from the Unit Themes).
      Return JSON.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    textCn: { type: Type.STRING },
                    blanks: { 
                        type: Type.ARRAY, 
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.INTEGER },
                                correctWord: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        }
                    },
                    imagePrompt: { type: Type.STRING }
                },
                required: ["text", "blanks", "imagePrompt"]
            }
        }
      });
      if (response.text) return JSON.parse(response.text);
      throw new Error("No data");
    } catch (e) { throw e; }
  };
  
  // --- Reading Exercise ---
  export const generateReadingExercise = async (difficulty: DifficultyLevel = 5): Promise<ReadingExercise> => {
    const levelContext = getLevelPrompt(difficulty);
    const prompt = `
      Create a short reading passage (80 words).
      CURRICULUM: ${levelContext}
      Topic: Choose a topic from the Unit Themes of this level.
      Create 2 questions.
      
      Return JSON.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    passage: { type: Type.STRING },
                    passageCn: { type: Type.STRING },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                questionCn: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctIndex: { type: Type.INTEGER }
                            }
                        }
                    },
                    imagePrompt: { type: Type.STRING }
                },
                required: ["title", "passage", "questions", "imagePrompt"]
            }
        }
      });
      if (response.text) return JSON.parse(response.text);
      throw new Error("No data");
    } catch (e) { throw e; }
  };

  // --- Listening Exercise (Sonic Cipher) ---
  export const generateListeningExercise = async (difficulty: DifficultyLevel = 5): Promise<ListeningExercise> => {
    const levelContext = getLevelPrompt(difficulty);
    const prompt = `
      Create a Listening Comprehension script.
      CURRICULUM: ${levelContext}
      
      1. 'audioScript': A short description or dialogue (1-2 sentences) using Unit vocabulary.
      2. 'question': A question about the detail in the script.
      3. 'options': 4 choices for the answer.
      4. 'imagePrompt': Visual context for the general theme (not the answer itself).
      
      Return JSON.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    audioScript: { type: Type.STRING },
                    question: { type: Type.STRING },
                    questionCn: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    imagePrompt: { type: Type.STRING }
                },
                required: ["audioScript", "question", "options", "correctIndex", "imagePrompt"]
            }
        }
      });
      if (response.text) return JSON.parse(response.text);
      throw new Error("No data");
    } catch (e) { throw e; }
  };

  // --- Speaking Exercise (Echo Pilot) ---
  export const generateSpeakingExercise = async (difficulty: DifficultyLevel = 5): Promise<SpeakingExercise> => {
    const levelContext = getLevelPrompt(difficulty);
    const prompt = `
      Create a Speaking Challenge phrase.
      CURRICULUM: ${levelContext}
      
      1. 'phrase': A key sentence using grammar/vocab from the level (e.g., "I like playing football" for Level 1).
      2. 'context': Situation description (e.g. "Tell your friend what you like").
      3. 'keywords': List of key words in the phrase to check for.
      
      Return JSON.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_TEXT,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    phrase: { type: Type.STRING },
                    phraseCn: { type: Type.STRING },
                    context: { type: Type.STRING },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    imagePrompt: { type: Type.STRING }
                },
                required: ["phrase", "context", "keywords", "imagePrompt"]
            }
        }
      });
      if (response.text) return JSON.parse(response.text);
      throw new Error("No data");
    } catch (e) { throw e; }
  };