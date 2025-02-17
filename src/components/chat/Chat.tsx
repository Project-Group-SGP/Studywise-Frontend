import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getGroupMessages } from "@/lib/group-api";
import {
  Book,
  Mic,
  MicOff,
  PhoneCall,
  Send,
  Smile,
  X
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../providers/auth";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Message } from "@/type";
import { format, isToday, isYesterday } from "date-fns";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { MessageContent } from "./Message";
import { toast } from "sonner";


interface PeerConnection {
  userId: string;
  userName: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

// Update the interface to match server data
interface CallParticipantInfo {
  socketId: string;
  userId: string;
  userName: string;
}

// Update state to include socketId
interface CallParticipant {
  id: string;
  socketId: string;
  name: string;
}


const ChatRoom = ({ groupId }: { groupId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callParticipants, setCallParticipants] = useState<CallParticipant[]>([]);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const userId = user?.id;

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const initializeWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      // Add error feedback to user
      if (!stream || !stream.getAudioTracks().length) {
        throw new Error("No audio device found");
      }
      localStreamRef.current = stream;
      stream.getAudioTracks()[0].enabled = !isMuted;
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      // Add user feedback
      alert("Failed to access microphone. Please check permissions.");
      return null;
    }
  };
  const createPeerConnection = (targetUserId: string, targetUserName: string): RTCPeerConnection => {
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        // Add TURN servers for better connectivity
        {
          urls: "turn:your-turn-server.com",
          username: "username",
          credential: "credential",
        },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream tracks to peer connection
    localStreamRef.current?.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStreamRef.current!);
    });

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      const connection = peerConnectionsRef.current.get(targetUserId);
      if (connection) {
        connection.stream = event.streams[0];
        const audioElement = new Audio();
        audioElement.srcObject = event.streams[0];
        audioElement.play();
        setCallParticipants((prev) => {
          const exists = prev.some(p => p.id === targetUserId);
          if (!exists) {
            return [...prev, { id: targetUserId, socketId: targetUserId, name: connection.userName || 'Unknown User' }];
          }
          return prev;
        });
      }
    };

    // ICE candidate handling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("iceCandidate", {
          groupId,
          candidate: event.candidate,
          senderId: socket?.id,
          receiverId: targetUserId,
          senderName: user?.name,
          receiverName: targetUserName
        });
      }
    };

    peerConnectionsRef.current.set(targetUserId, {
      userId: targetUserId,
      userName: targetUserName,
      connection: peerConnection,
    });

    return peerConnection;
  };

  const handleJoinCall = async () => {
    const stream = await initializeWebRTC();
    if (!stream) return;

    setIsInCall(true);
    socket?.emit("joinGroupCall", { 
      groupId, 
      userId,
      userName: user?.name
    });
  };

  const handleLeaveCall = () => {
    // Stop local stream
    localStreamRef.current?.getTracks().forEach((track) => track.stop());

    // Clean up peer connections
    peerConnectionsRef.current.forEach((peer) => {
      peer.connection.close();
    });
    peerConnectionsRef.current.clear();

    setIsInCall(false);
    setCallParticipants([]);

  

    
    // Send complete user info when leaving
    if(socket)
    socket?.emit("leaveGroupCall", { 
      groupId,
      userId,
      userName: user?.name 
    });


  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.emit("joinGroup", groupId);
    fetchMessages();

    newSocket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 0);
    });

    newSocket.on("typing", ({ userName }) => {
      setTypingUsers((prev) => new Set(prev).add(userName));
    });

    newSocket.on("stopTyping", ({ userId }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Audio call related events
    newSocket.on("userJoinedCall", async ({ socketId, userId, userName }) => {
      setCallParticipants((prev) => {
        const exists = prev.some(p => p.id === userId);
        if (!exists) {
          return [...prev, { 
            id: userId, 
            socketId: socketId,
            name: userName || 'Unknown User' 
          }];
        }
        return prev;
      });

      if (isInCall) {
        const peerConnection = createPeerConnection(socketId, userName);
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket?.emit("offer", {
          groupId,
          offer,
          receiverId: socketId,
          senderName: user?.name,
          receiverName: userName
        });
      }
    });

    newSocket.on("userLeftCall", ({ socketId, userId, userName }) => {
      const peer = peerConnectionsRef.current.get(socketId);
      if (peer) {
        peer.connection.close();
        peerConnectionsRef.current.delete(socketId);
        setCallParticipants((prev) => prev.filter(p => p.socketId !== socketId));
        toast.info(`${userName || 'Someone'} left the call`);
      }
    });

    newSocket.on("offer", async ({ offer, senderId, senderName }) => {
      const peerConnection = createPeerConnection(senderId, senderName);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket?.emit("answer", {
        groupId,
        answer,
        senderId: socket.id,
        receiverId: senderId,
        senderName: user?.name,
        receiverName: senderName
      });
    });

    newSocket.on("answer", async ({ answer, senderId }) => {
      const peerConnection =
        peerConnectionsRef.current.get(senderId)?.connection;
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    newSocket.on("iceCandidate", async ({ candidate, senderId }) => {
      const peerConnection =
        peerConnectionsRef.current.get(senderId)?.connection;
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    newSocket.on("existingParticipants", (participants: CallParticipantInfo[]) => {
      setCallParticipants(
        participants.map((p) => ({ 
          id: p.userId,
          socketId: p.socketId, 
          name: p.userName 
        }))
      );
    });

    newSocket.on("userLeftCall", ({ socketId, userId, userName }) => {
      // Try to find and close the peer connection using socketId
      const peer = peerConnectionsRef.current.get(socketId);
      if (peer) {
        peer.connection.close();
        peerConnectionsRef.current.delete(socketId);
      }
      
      // Update participants using BOTH socketId and userId to ensure removal
      setCallParticipants((prev) => prev.filter(p => 
        p.socketId !== socketId && p.id !== userId
      ));
      
      toast.info(`${userName || 'Someone'} left the call`);
    });

    // Add error handler
    newSocket.on("error", (message: string) => {
      toast.error(message);
    });

    // Add connection state change logging
    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setCallParticipants([]);
      setIsInCall(false);
    });

    return () => {
      handleLeaveCall();
      newSocket.off("error");
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.disconnect();
    };
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await getGroupMessages(groupId);
      setMessages(response);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM dd, yyyy");
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "hh:mm a");
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { [date: string]: Message[] } = {};
    messages.forEach((message) => {
      const date = formatDateHeader(message.updatedAt);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(message);
    });
    return grouped;
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const timestamp = new Date().toISOString();
    socket?.emit("sendMessage", {
      content: newMessage,
      userId,
      groupId,
      timestamp,
    });

    setNewMessage("");
  };

  const handleTyping = () => {
    socket?.emit("typing", {
      groupId,
      userId,
      userName: user?.name,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stopTyping", {
        groupId,
        userId: user?.id,
      });
    }, 1000);
  };

  const renderCallParticipants = () => {
    return (
      <div className="flex flex-wrap gap-2">
        {callParticipants?.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
          >
            <Avatar className="w-6 h-6">
              <AvatarFallback>
                {participant.id === userId ? 'Y' : (participant?.name?.charAt(0) || '?')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {participant.id === userId ? 'You' : (participant?.name || 'Unknown')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}

      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Book className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Study Group Chat
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Active Members: {typingUsers.size} | In Call:{" "}
              {callParticipants.length}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!isInCall ? (
            <Button
              variant="outline"
              onClick={handleJoinCall}
              className="bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <PhoneCall className="w-4 h-4 mr-2 text-green-500" />
              <span>Join Audio Call</span>
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={toggleMute}
                className={`${
                  isMuted
                    ? "bg-red-100 hover:bg-red-200"
                    : "bg-white hover:bg-gray-100"
                } dark:bg-gray-800 dark:hover:bg-gray-700`}
              >
                {isMuted ? (
                  <MicOff className="w-4 h-4 text-red-500" />
                ) : (
                  <Mic className="w-4 h-4 text-green-500" />
                )}
              </Button>
              <Button variant="destructive" onClick={handleLeaveCall}>
                <X className="w-4 h-4 mr-2" />
                Leave Call
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Call participants bar */}
      {isInCall && (
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-2">
          <div className="flex items-center space-x-2">
            <PhoneCall className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">
              Active Call Participants:
            </span>
            {renderCallParticipants()}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center justify-center">
                <span className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {date}
                </span>
              </div>
              <div className="space-y-4 mt-4">
                {msgs.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.userId === userId ? "justify-end" : ""
                    }`}
                  >
                    {message.userId !== userId && (
                      <Avatar className="w-8 h-8 ring-2 ring-white dark:ring-gray-800">
                        <AvatarImage src={message.user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {message.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`flex flex-col ${
                        message.userId === userId ? "items-end" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {message.user.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatMessageTime(message.updatedAt)}
                        </span>
                      </div>
                      <div
                        className={`mt-1 rounded-2xl px-4 py-2 text-sm max-w-md ${
                          message.userId === userId
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                        }`}
                      >
                        <MessageContent content={message.content} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {typingUsers.size > 0 && (
          <div className="mt-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            {Array.from(typingUsers).join(", ")} typing...
          </div>
        )}
      </ScrollArea>

      {/* Input Section */}
      <div className="p-6 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-3"
        >
          <Input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type your message..."
            className="flex-1 bg-gray-50 dark:bg-gray-700 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="bg-gray-50 dark:bg-gray-700 border-0 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Smile className="w-5 h-5 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0">
              <EmojiPicker
                onEmojiClick={(emoji) =>
                  setNewMessage((prev) => prev + emoji.emoji)
                }
                height={400}
                width={300}
                searchDisabled
                emojiStyle={EmojiStyle.NATIVE}
              />
            </PopoverContent>
          </Popover>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
