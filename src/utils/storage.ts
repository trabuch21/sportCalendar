import { User, Race } from '../types';

const USERS_KEY = 'race_calendar_users';
const RACES_KEY = 'race_calendar_races';
const CURRENT_USER_KEY = 'race_calendar_current_user';

// User storage
export function saveUser(user: User): void {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getUserByEmail(email: string): User | null {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

// Race storage
export function saveRace(race: Race): void {
  const races = getRaces();
  const existingIndex = races.findIndex(r => r.id === race.id);
  if (existingIndex >= 0) {
    races[existingIndex] = race;
  } else {
    races.push(race);
  }
  localStorage.setItem(RACES_KEY, JSON.stringify(races));
}

export function getRaces(userId?: string): Race[] {
  const data = localStorage.getItem(RACES_KEY);
  const allRaces: Race[] = data ? JSON.parse(data) : [];
  if (userId) {
    return allRaces.filter(r => r.userId === userId);
  }
  return allRaces;
}

export function getRaceById(id: string): Race | null {
  const races = getRaces();
  return races.find(r => r.id === id) || null;
}

export function deleteRace(id: string): void {
  const races = getRaces();
  const filtered = races.filter(r => r.id !== id);
  localStorage.setItem(RACES_KEY, JSON.stringify(filtered));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

