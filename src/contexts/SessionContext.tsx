import React, { createContext, useContext, useState } from 'react';

interface Session {
  id: string;
  title: string;
  date: string;
  duration?: number;
  description: string;
  isActive: boolean;
  startedAt?: string;
  prerequisites?: string;
  meetingLink?: string;
  maxParticipants?: number;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface SessionContextType {
  sessions: Session[];
  activeSessions: Session[];
  addSession: (session: Omit<Session, "id" | "isActive" | "startedAt">) => void;
  startSession: (id: string) => void;
  endSession: (id: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      title: 'Quantum Mechanics Basics',
      date: '2024-03-20T15:00:00',
      description: 'Introduction to quantum mechanics fundamentals',
      isActive: false,
      createdBy: {
        id: 'user1',
        name: 'Dr. Smith',
        avatar: '/avatars/smith.jpg'
      }
    },
    // Add more sample sessions...
  ]);

  const [activeSessions, setActiveSessions] = useState<Session[]>([]);

  const addSession = async (newSession: Omit<Session, "id" | "isActive" | "startedAt">) => {
    // TODO: API - Create new session
    // POST /api/sessions
    // Should:
    // 1. Create new session in database
    // 2. Return created session with ID
    // 3. Notify group members about new session

    const session: Session = {
      ...newSession,
      id: `session-${Date.now()}`,
      isActive: false,
      startedAt: new Date().toISOString(),
    };
    setSessions(prev => [...prev, session]);
  };

  const startSession = async (sessionId: string) => {
    // TODO: API - Start session
    // POST /api/sessions/{sessionId}/start
    // Should:
    // 1. Update session status to active
    // 2. Record start time
    // 3. Allow participants to join
    // 4. Return updated session data with startedAt time

    const session = sessions.find(s => s.id === sessionId);
    if (session && !session.isActive) {
      const updatedSession = {
        ...session,
        isActive: true,
        startedAt: new Date().toISOString(),
      };
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      setActiveSessions(prev => [...prev, updatedSession]);
    }
  };

  const endSession = async (sessionId: string) => {
    // TODO: API - End session
    // POST /api/sessions/{sessionId}/end
    // Should:
    // 1. Update session status to completed
    // 2. Record end time and duration
    // 3. Save session statistics
    // 4. Notify participants

    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isActive: false } : s));
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  return (
    <SessionContext.Provider value={{ sessions, activeSessions, addSession, startSession, endSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}; 