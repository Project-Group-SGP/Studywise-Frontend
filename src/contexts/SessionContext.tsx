import { useAuth } from "@/components/providers/auth";
import { socket } from '@/lib/socket';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Session {
  id: string;
  name: string;
  description?: string;
  time: string;
  prerequisites?: string;
  isStarted: boolean;
  startedAt?: string;
  endedAt?: string;
  groupId: string;
  creatorID: string;
  createdAt: string;
  creator: {
    id: string;
    name: string;
  };
  participants?: Array<{
    socketId: string;
    userId: string;
    userName: string;
    joinedAt: number;
  }>;
}

interface SessionContextType {
  sessions: Session[];
  activeSessions: Session[];
  addSession: (session: {
    name: string;
    time: string;
    description?: string;
    prerequisites?: string;
    groupId: string;
  }) => Promise<void>;
  startSession: (id: string) => Promise<void>;
  endSession: (id: string) => Promise<void>;
  fetchGroupSessions: (groupId: string) => Promise<void>;
  joinSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  editSession: (id: string, updates: Partial<Session>) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Join session room when socket connects
    socket.on('connect', () => {
      console.log('Connected to session socket');
    });

    // Listen for session events
    socket.on('sessionParticipants', (participants) => {
      setActiveSessions(prev => prev.map(session => ({
        ...session,
        participants: participants.map((p: { 
          socketId: string;
          userId: string;
          userName: string;
          joinedAt: number;
        }) => ({
          socketId: p.socketId,
          userId: p.userId,
          userName: p.userName,
          joinedAt: p.joinedAt
        }))
      })));
    });

    socket.on('userJoinedSession', (participant) => {
      setActiveSessions(prev => prev.map(session => ({
        ...session,
        participants: [...(session.participants || []), {
          socketId: participant.socketId,
          userId: participant.userId,
          userName: participant.userName,
          joinedAt: participant.joinedAt
        }]
      })));
    });

    socket.on('userLeftSession', ({ socketId, userId, userName }) => {
      setActiveSessions(prev => prev.map(session => ({
        ...session,
        participants: session.participants?.filter(p => p.socketId !== socketId)
      })));
    });

    socket.on('sessionStarted', ({ sessionId, startedAt }) => {
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, isStarted: true, startedAt } : s
      ));
    });

    socket.on('sessionEnded', ({ sessionId, endedAt }) => {
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, isStarted: false, endedAt } : s
      ));
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    });

    return () => {
      socket.off('connect');
      socket.off('sessionParticipants');
      socket.off('userJoinedSession');
      socket.off('userLeftSession');
      socket.off('sessionStarted');
      socket.off('sessionEnded');
    };
  }, []);

  const startSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session || session.isStarted || !user) return;

      // Emit socket event to start session
      socket.emit('startSession', { sessionId });

      // Join the session room
      socket.emit('joinSession', {
        sessionId,
        userId: user.id,
        userName: user.name
      });

      const updatedSession = { ...session, isStarted: true };
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      setActiveSessions(prev => [...prev, updatedSession]);
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      // Emit socket event to end session
      socket.emit('endSession', { sessionId });
      
      // Leave the session room
      socket.emit('leaveSession', { sessionId });
      
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isStarted: false } : s));
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  };

  const addSession = async (newSession: {
    name: string;
    time: string;
    description?: string;
    prerequisites?: string;
    groupId: string;
  }) => {
    try {
      // Create the session in the database
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newSession),
      });
      
      if (!response.ok) throw new Error('Failed to create session');
      
      const createdSession = await response.json();
      setSessions(prev => [...prev, createdSession]);
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  // Fetch the sessions for the group
  const fetchGroupSessions = async (groupId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/group/${groupId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Join the session
  const joinSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session || !user) return;

      socket.emit('joinSession', {
        sessionId,
        userId: user.id,
        userName: user.name
      });

      setActiveSessions(prev => [...prev, session]);
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  };

  // Delete the session
  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete session');
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  };

  // Edit the session
  const editSession = async (sessionId: string, updates: Partial<Session>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update session');
      const updatedSession = await response.json();
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  };

  return (
    <SessionContext.Provider value={{ 
      sessions, 
      activeSessions, 
      addSession, 
      startSession, 
      endSession,
      fetchGroupSessions,
      joinSession,
      deleteSession,
      editSession,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}; 