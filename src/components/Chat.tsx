import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./providers/auth";
import { getGroupMessages } from "@/lib/group-api";
import { Send, Smile, Users, Book, PhoneCall, Video, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isToday, isYesterday } from "date-fns";
import { Message } from "@/type";

const ChatRoom = ({ groupId }: { groupId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
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

    return () => {
      newSocket.disconnect();
    };
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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


  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Book className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Study Group Chat</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" >
            <PhoneCall className="w-5 h-5 mr-2" /> Audio Call
          </Button>
          <Button variant="outline" >
            <Video className="w-5 h-5 mr-2" /> Video Call
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="text-center text-xs text-muted-foreground py-2">
                {date}
              </div>
              {msgs.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.userId === userId ? "justify-end" : ""
                  }`}
                >
                  {message.userId !== userId && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.user.avatar} />
                      <AvatarFallback>
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
                      <span className="text-sm font-medium">
                        {message.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(message.updatedAt)}
                      </span>
                    </div>
                    <div
                      className={`mt-1 rounded-lg px-3 py-2 text-sm ${
                        message.userId === userId
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {typingUsers.size > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {Array.from(typingUsers).join(", ")} typing...
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* Input Section */}
      <div className="p-4">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <Input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="icon">
                <Smile className="w-4 h-4" />
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
          <Button type="submit">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
