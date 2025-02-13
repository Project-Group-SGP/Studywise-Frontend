import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import {  GripHorizontal, Minimize2, Maximize2, StopCircle, CheckCircle, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface SessionTimerProps {
  session: {
    id: string;
    name: string;
    startedAt?: string;
    endedAt?: string;
    creatorID: string;
    participants?: Array<{
      socketId: string;
      userId: string;
      userName: string;
      joinedAt: number;
    }>;
  };
  onClose: () => void;
  onLeave: () => void;
  currentUserId: string;
}

export const SessionTimer = ({ session, onClose, onLeave, currentUserId }: SessionTimerProps) => {
  const [elapsed, setElapsed] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const isCreator = currentUserId === session.creatorID;

  console.log ( "currentUSer :  " , currentUserId);
  console.log( "creatorID :  " , session.creatorID);
  
  

  useEffect(() => {
    if (!session.startedAt) return;
    
    // If session is ended, calculate final elapsed time and cleanup
    if (session.endedAt) {
      const start = new Date(session.startedAt).getTime();
      const end = new Date(session.endedAt).getTime();
      setElapsed(end - start);
      
      // If not creator, trigger leave
      if (!isCreator) {
        onLeave();
      }
      return;
    }
    
    // Calculate initial elapsed time for ongoing session
    const start = new Date(session.startedAt).getTime();
    const now = new Date().getTime();
    setElapsed(now - start);
    
    // Set up the interval for ongoing updates
    const interval = setInterval(() => {
      const start = new Date(session.startedAt!).getTime();
      const now = new Date().getTime();
      const newElapsed = now - start;
      setElapsed(newElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [session.startedAt, session.endedAt, isCreator, onLeave]);

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

              <div className="flex flex-col gap-2 mt-4">
                <div className="text-xs text-primary-foreground/70">
                  Started at {session.startedAt && new Date(session.startedAt).toLocaleTimeString()}
                  {session.endedAt && (
                    <div>
                      Ended at {new Date(session.endedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                
                {!session.endedAt && (
                  <Button 
                    variant="secondary" 
                    className={cn(
                      "w-full",
                      isCreator && "hover:bg-destructive hover:text-destructive-foreground"
                    )}
                    onClick={isCreator ? onClose : onLeave}
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    {isCreator ? 'End Session' : 'Leave Session'}
                  </Button>
                )}
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