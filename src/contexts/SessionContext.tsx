import { useAuth } from "@/components/providers/auth";
import { socket } from "@/lib/socket";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  leaveSession: (id: string) => Promise<void>;
  fetchGroupSessions: (groupId: string) => Promise<void>;
  joinSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  editSession: (id: string, updates: Partial<Session>) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Join session room when socket connects
    socket.on("connect", () => {
      console.log("Connected to session socket");
    });

    // Listen for session events
    socket.on("sessionParticipants", (participants) => {
      setActiveSessions((prev) =>
        prev.map((session) => ({
          ...session,
          participants: participants.map(
            (p: {
              socketId: string;
              userId: string;
              userName: string;
              joinedAt: number;
            }) => ({
              socketId: p.socketId,
              userId: p.userId,
              userName: p.userName,
              joinedAt: p.joinedAt,
            })
          ),
        }))
      );
    });

    socket.on("userJoinedSession", (participant) => {
      setActiveSessions((prev) =>
        prev.map((session) => ({
          ...session,
          participants: [
            ...(session.participants || []),
            {
              socketId: participant.socketId,
              userId: participant.userId,
              userName: participant.userName,
              joinedAt: participant.joinedAt,
            },
          ],
        }))
      );
    });

    socket.on("userLeftSession", ({ socketId, userId, userName }) => {
      setActiveSessions((prev) =>
        prev.map((session) => ({
          ...session,
          participants: session.participants?.filter(
            (p) => p.socketId !== socketId
          ),
        }))
      );
    });

    socket.on("sessionStarted", ({ sessionId, startedAt }) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, isStarted: true, startedAt } : s
        )
      );
    });

    socket.on("sessionEnded", ({ sessionId, endedAt }) => {
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, isStarted: false, endedAt } : s
      ));
      // Remove from active sessions and handle automatic leave
      setActiveSessions(prev => {
        const session = prev.find(s => s.id === sessionId);
        if (session) {
          // Emit leave session event for all participants
          socket.emit('leaveSession', { sessionId });
        }
        return prev.filter(s => s.id !== sessionId);
      });
    });

    return () => {
      socket.off("connect");
      socket.off("sessionParticipants");
      socket.off("userJoinedSession");
      socket.off("userLeftSession");
      socket.off("sessionStarted");
      socket.off("sessionEnded");
    };
  }, []);

  //? All socket events

  const startSession = async (sessionId: string) => {
    try {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session || session.isStarted || !user) return;

      // Emit socket event to start session
      socket.emit("startSession", { sessionId });

      // Join the session room
      socket.emit("joinSession", {
        sessionId,
        userId: user.id,
        userName: user.name,
      });

      // Make sure you're updating the session with the current timestamp
      const now = new Date().toISOString();
      const updatedSession = {
        ...session,
        isStarted: true,
        startedAt: now  // This is crucial!
      };
      
      // Update your active sessions state with the proper timestamp
      setActiveSessions(prev => [...prev, updatedSession]);
    } catch (error) {
      console.error("Error starting session:", error);
      throw error;
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      const now = new Date().toISOString();

      // Immediately update local state
      setActiveSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, endedAt: now }
            : session
        )
      );

      // Update sessions list
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, endedAt: now }
            : session
        )
      );

      // Emit socket event for real-time updates
      socket?.emit('endSession', { sessionId});

    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  };

  const leaveSession = async (sessionId: string) => {
    try {
      // Emit socket event to leave session
      socket.emit("leaveSession", { sessionId });
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("Error leaving session:", error);
      throw error;
    }
  };

  // Join the session
  const joinSession = async (sessionId: string) => {
    try {
      // Find the session and user
      const session = sessions.find((s) => s.id === sessionId);

      if (!session || !user) return;

      // Emit socket event to join session -> send sessionId, userId, userName
      socket.emit("joinSession", {
        sessionId,
        userId: user.id,
        userName: user.name,
      });

      // Make sure the session data includes the startedAt timestamp
      // This should come from your backend/socket
      const sessionWithTimestamp = {
        ...session,
        startedAt: session.startedAt // Make sure this exists
      };
      
      setActiveSessions(prev => [...prev, sessionWithTimestamp]);
    } catch (error) {
      console.error("Error joining session:", error);
      throw error;
    }
  };


  //? All API calls
  // Fetch the sessions for the group with the group ID
  const fetchGroupSessions = async (groupId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sessions/group/${groupId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch sessions");

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  // Add a new session
  const addSession = async (newSession: {
    name: string;
    time: string;
    description?: string;
    prerequisites?: string;
    groupId: string;
  }) => {
    try {
      // Create the session in the database
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(newSession),
        }
      );

      if (!response.ok) throw new Error("Failed to create session");

      const createdSession = await response.json();
      setSessions((prev) => [...prev, createdSession]);
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  };
  // Delete the session
  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sessions/${sessionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete session");
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  };

  // Edit the session
  const editSession = async (sessionId: string, updates: Partial<Session>) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sessions/${sessionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error("Failed to update session");
      const updatedSession = await response.json();
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updatedSession : s))
      );
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  };

  // Add socket listener for session end events
  useEffect(() => {
    if (!socket) return;

    socket.on('session:ended', ({ sessionId, endedAt }) => {
      setActiveSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, endedAt }
            : session
        )
      );

      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, endedAt }
            : session
        )
      );
    });

    return () => {
      socket.off('session:ended');
    };
  }, [socket]);

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSessions,
        addSession,
        startSession,
        endSession,
        leaveSession,
        fetchGroupSessions,
        joinSession,
        deleteSession,
        editSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context)
    throw new Error("useSession must be used within SessionProvider");
  return context;
};
