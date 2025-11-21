
import { UserAccount, UserProgress, LeaderboardEntry } from '../types';

const DB_KEY = 'farsiFlowUsers';
const SESSION_KEY = 'farsiFlowSession';

// Helper to get all users
const getUsers = (): UserAccount[] => {
  const stored = localStorage.getItem(DB_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper to save users
const saveUsers = (users: UserAccount[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
};

// Calculates if streak should be incremented, reset, or maintained
export const checkAndUpdateStreak = (user: UserAccount): UserAccount => {
    const now = Date.now();
    const lastDate = new Date(user.progress.lastActivityDate || 0);
    const today = new Date(now);
    
    // Normalize to midnight to compare days only
    const lastMidnight = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const diffTime = Math.abs(todayMidnight.getTime() - lastMidnight.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = user.progress.streak || 1;

    if (diffDays === 1) {
        // Consecutve day
        newStreak += 1;
    } else if (diffDays > 1) {
        // Missed a day
        newStreak = 1;
    }
    // if diffDays === 0 (Same day), do nothing

    const updatedUser = {
        ...user,
        progress: {
            ...user.progress,
            streak: newStreak,
            lastActivityDate: now
        }
    };
    
    updateUserProgress(user.id, updatedUser.progress);
    return updatedUser;
};

export const login = async (email: string, password: string): Promise<UserAccount | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (user) {
    localStorage.setItem(SESSION_KEY, user.id);
    return checkAndUpdateStreak(user);
  }
  return null;
};

export const signup = async (name: string, email: string, password: string): Promise<UserAccount | { error: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'User already exists' };
  }

  const newUser: UserAccount = {
    id: Date.now().toString(),
    name,
    email,
    password, // Note: In a real app, never store passwords in plain text!
    joinedAt: Date.now(),
    progress: {
      currentLevel: 1,
      levelProgress: {},
      xp: 0,
      streak: 1,
      lastActivityDate: Date.now(),
      vocabulary: []
    }
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, newUser.id);
  
  return newUser;
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): UserAccount | null => {
  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) return null;
  
  const users = getUsers();
  const user = users.find(u => u.id === sessionId) || null;
  
  if (user) {
      return checkAndUpdateStreak(user);
  }
  return null;
};

export const updateUserProgress = (userId: string, newProgress: UserProgress) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    // Ensure we keep the latest activity date if specifically updating progress during a session
    if (!newProgress.lastActivityDate) {
        newProgress.lastActivityDate = Date.now();
    }
    users[index].progress = newProgress;
    saveUsers(users);
  }
};

export const generateLeaderboard = (currentUser: UserAccount): LeaderboardEntry[] => {
    const bots = [
        { name: "Sarah K.", baseXp: 50, color: "bg-blue-100 text-blue-600" },
        { name: "Amir M.", baseXp: 120, color: "bg-green-100 text-green-600" },
        { name: "John D.", baseXp: 300, color: "bg-purple-100 text-purple-600" },
        { name: "Elena R.", baseXp: 450, color: "bg-orange-100 text-orange-600" },
        { name: "Wei L.", baseXp: 80, color: "bg-red-100 text-red-600" },
    ];

    // Generate mock XP around the user's XP to make it competitive
    const entries: LeaderboardEntry[] = bots.map(bot => ({
        rank: 0,
        name: bot.name,
        xp: Math.max(10, Math.floor(currentUser.progress.xp + (Math.random() * 200 - 100) + bot.baseXp)),
        isUser: false,
        avatarColor: bot.color
    }));

    // Add current user
    entries.push({
        rank: 0,
        name: currentUser.name,
        xp: currentUser.progress.xp,
        isUser: true,
        avatarColor: "bg-emerald-100 text-emerald-600"
    });

    // Sort and assign rank
    return entries
        .sort((a, b) => b.xp - a.xp)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
};
