import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { X, GripHorizontal, Minimize2, Maximize2, StopCircle } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";

interface SessionTimerProps {
  session: {
    id: string;
    name: string;
    startedAt?: string;
    participants?: Array<{
      socketId: string;
      userId: string;
      userName: string;
      joinedAt: number;
    }>;
  };
  onClose: () => void;
}

export const SessionTimer = ({ session, onClose }: SessionTimerProps) => {
  const [elapsed, setElapsed] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [participants, setParticipants] = useState(session.participants || []);

  useEffect(() => {
    // TODO: API - Fetch real-time session participants
    // GET /api/sessions/{sessionId}/participants
    // Should return array of participants with their details
    // Consider using WebSocket for real-time updates
  }, [session.id]);

  useEffect(() => {
    if (!session.startedAt) return;
    
    const interval = setInterval(() => {
      const start = new Date(session.startedAt!).getTime();
      const now = new Date().getTime();
      const newElapsed = now - start;
      setElapsed(newElapsed);

      // TODO: API - Update session duration in backend
      // POST /api/sessions/{sessionId}/duration
      // Payload: { duration: newElapsed }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.startedAt]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor(ms / 1000 / 60 / 60);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed z-50 cursor-move"
      initial={{ x: window.innerWidth - 350, y: window.innerHeight - 200 }}
      animate={{ 
        width: isMinimized ? "auto" : "18rem",
        height: "auto" 
      }}
    >
      <Card className={`bg-primary text-primary-foreground shadow-lg transition-all duration-300 ${isMinimized ? 'w-auto' : 'w-72'}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GripHorizontal className="h-4 w-4 text-primary-foreground/70" />
              {!isMinimized && <span className="text-sm font-medium">{session.name}</span>}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-primary-foreground/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-primary-foreground/20"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              <div className="font-mono text-2xl font-bold text-center py-2">
                {formatTime(elapsed)}
              </div>
              
              <div className="mt-4 mb-2">
                <h4 className="text-sm font-medium mb-2">
                  Participants ({session.participants?.length || 0})
                </h4>
                <ScrollArea className="h-20">
                  <div className="flex flex-wrap gap-2">
                    {session.participants?.map((participant) => (
                      <div key={participant.userId} className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{participant.userName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{participant.userName}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-xs text-primary-foreground/70">
                  Started at {session.startedAt && new Date(session.startedAt).toLocaleTimeString()}
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full mt-2 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    // TODO: API - End session
                    // POST /api/sessions/{sessionId}/end
                    // Should update session status and notify participants
                    onClose();
                  }}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  End Session
                </Button>
              </div>
            </>
          )}
          
          {isMinimized && (
            <div className="font-mono font-bold px-2">
              {formatTime(elapsed)}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}; 