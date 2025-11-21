
export enum Language {
  EN = 'EN',
  ZH_TW = 'ZH_TW',
  JA = 'JA',
  KO = 'KO' // Mixed Script (Kukhanmun Honyong)
}

export interface LetterData {
  char: string;
  name: string;
  transliteration: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  exampleWord: string;
  exampleTransliteration: string;
  exampleMeaningEn: string;
  exampleMeaningZh: string;
}

export interface UIContent {
  title: string;
  subtitle: string;
  homeTab: string;
  learnTab: string;
  practiceTab: string;
  vocabTab: string; 
  tutorTab: string;
  connectTitle: string;
  connectDesc: string;
  pronounceBtn: string;
  example: string;
  chatPlaceholder: string;
  chatSend: string;
  loading: string;
  welcomeTutor: string;
  tutorIntro: string;
  startLevel: string;
  continueLevel: string; 
  stageIndicator: string; 
  locked: string;
  quizTitle: string;
  nextBtn: string;
  checkBtn: string;
  correct: string;
  incorrect: string;
  completed: string;
  xpEarned: string;
  wordsLearned: string;
  backHome: string;
  noWords: string;
  searchVocab: string;
  // Handout UI
  handoutTitle: string;
  startQuizBtn: string;
  vocabSection: string;
  grammarSection: string;
  sentencesSection: string;
  cultureSection: string;
  // Auth UI
  loginTitle: string;
  signupTitle: string;
  emailLabel: string;
  passwordLabel: string;
  nameLabel: string;
  loginBtn: string;
  signupBtn: string;
  switchNoAccount: string;
  switchHasAccount: string;
  logout: string;
  profile: string;
  welcomeBack: string;
  authError: string;
  authSuccess: string;
  fieldRequired: string;
  // Home UI
  dailyFactTitle: string;
  didYouKnow: string;
  refreshFact: string;
  continueJourney: string;
  totalXp: string;
  currentLevel: string;
  streak: string;
  days: string;
  leaderboardTitle: string;
  you: string;
  // Interactive Modals
  streakTitle: string;
  streakDesc: string;
  xpTitle: string;
  xpDesc: string;
  nextRank: string;
  selectStage: string;
  stage: string;
  playBtn: string;
  replayBtn: string;
  closeBtn: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface VocabularyMetadata {
    word: string;
    transliteration: string;
    meaning: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  pronunciationText?: string;
  wordMetadata?: VocabularyMetadata; 
}

export interface LevelConfig {
  id: number;
  titleEn: string;
  titleZh: string;
  titleJa: string;
  titleKo: string;
  descriptionEn: string;
  descriptionZh: string;
  topic: string;
  difficulty: string;
  stageLabelEn: string;
  stageLabelZh: string;
  stageLabelJa: string;
  stageLabelKo: string;
  icon: string; 
}

export interface VocabularyItem {
    id: string; 
    word: string;
    transliteration: string;
    meaning: string;
    learnedAtLevel: number;
    learnedAt: number; 
}

export interface UserProgress {
  currentLevel: number; // The highest unlocked Level ID
  levelProgress: Record<number, number>; // Map of Level ID -> Completed Stages (0 to 10)
  xp: number;
  streak: number;
  lastActivityDate: number; // Timestamp
  vocabulary: VocabularyItem[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string; // Stored locally for simulation
  joinedAt: number;
  progress: UserProgress;
}

export interface HandoutData {
  title: string;
  introduction: string;
  vocabulary: { word: string; transliteration: string; meaning: string }[];
  grammar: { title: string; content: string }[];
  sentences: { persian: string; transliteration: string; translation: string }[];
  culturalNote: string;
}

export interface FactData {
    title: string;
    content: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  isUser: boolean;
  avatarColor: string;
}
