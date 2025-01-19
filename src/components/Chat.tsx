import React, { useState, useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { useAuth } from './providers/auth'
import { getGroupMessages } from '@/lib/group-api'
import { MessageCircle, Send, Smile, Paperclip, Users, Phone, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import EmojiPicker from 'emoji-picker-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Message {
  id: string
  content: string
  userId: string
  user: {
    name: string
    avatar?: string
  }
}

const ChatRoom = ({ groupId }: { groupId: string }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [isInCall, setIsInCall] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth()
  const userId = user?.id

  // Previous socket and message handling code remains the same...
  // (Socket initialization, message fetching, and handlers remain unchanged)

     // Scroll to bottom of messages area
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }

    // Initialize socket connection
    useEffect(() => {
      const newSocket = io('http://localhost:3000')
      setSocket(newSocket)
  
      // Join group room
      newSocket.emit('joinGroup', groupId)
      fetchMessages()
  
      // Listen for new messages
      newSocket.on('message', (message) => {
        setMessages((prev) => {
          const newMessages = [...prev, message];
          setTimeout(scrollToBottom, 0);
          return newMessages;
        })
      })
  
      // Listen for typing events
      newSocket.on('typing', ({ userName }) => {
        setTypingUsers((prev) => new Set(prev).add(userName))
      })
  
      // Listen for stop typing events
      newSocket.on('stopTyping', ({ userId }) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
      })
  
      // Listen for call start
      newSocket.on('callStarted', ({ userId: callerUserId }) => {
        if (callerUserId !== userId) {
          setIsInCall(true)
        }
      })
  
      // Listen for call end
      newSocket.on('callEnded', () => {
        setIsInCall(false)
      })
  
      return () => {
        newSocket.disconnect()
      }
    }, [groupId])
  
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
  
    // Fetch messages for the group
    const fetchMessages = async () => {
      try {
        const response = await getGroupMessages(groupId)
        setMessages(response)
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }
  
    // Send a new message
    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!newMessage.trim()) return
  
      socket?.emit('sendMessage', {
        content: newMessage,
        userId,
        groupId,
      })
  
      setNewMessage('')
    }
  
    // Notify other users when typing
    const handleTyping = () => {
      socket?.emit('typing', {
        groupId,
        userId,
        userName: user?.name,
      })
  
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
  
      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit('stopTyping', {
          groupId,
          userId: user?.id,
        })
      }, 1000)
    }
  
    // Handle emoji click
    const onEmojiClick = (emojiData: any) => {
      const emoji = emojiData.emoji;
      const cursorPosition = inputRef.current?.selectionStart || newMessage.length;
      const updatedMessage = 
        newMessage.slice(0, cursorPosition) + 
        emoji + 
        newMessage.slice(cursorPosition);
      
      setNewMessage(updatedMessage);
      
      // Focus back on input and set cursor position after emoji
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(
          cursorPosition + emoji.length,
          cursorPosition + emoji.length
        );
      }, 0);
    }
  
    const toggleAudioCall = () => {
      if (isInCall) {
        // Logic to end the call
        socket?.emit('endCall', { groupId, userId })
        setIsInCall(false)
      } else {
        // Logic to start the call
        socket?.emit('startCall', { groupId, userId })
        setIsInCall(true)
      }
    }
  

  const handleScroll = (event: any) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto rounded-2xl border bg-gradient-to-b from-background to-background/95 shadow-2xl relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />

      {/* Chat Header */}
      <div className="relative flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm bg-background/50">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-primary/10 animate-pulse">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Group Chat
            </h2>
            <p className="text-sm text-muted-foreground flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              {isInCall ? (
                <span className="text-primary font-medium">Live Call in Progress</span>
              ) : typingUsers.size > 0 ? (
                <span className="text-primary animate-pulse">
                  {Array.from(typingUsers).join(', ')} typing...
                </span>
              ) : (
                <span className="flex items-center space-x-1">
                  <span>{messages.length}</span>
                  <span>messages in chat</span>
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-primary/10 transition-colors"
          >
            <Users className="w-5 h-5" />
          </Button>
          <Button 
            variant={isInCall ? "destructive" : "default"}
            size="icon"
            onClick={toggleAudioCall}
            className="rounded-full hover:scale-105 transition-transform"
          >
            <Phone className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 p-6"
        onScrollCapture={handleScroll}
      >
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.userId === userId ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarImage src={message.user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {message.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col space-y-1 max-w-[70%] ${
                  message.userId === userId ? 'items-end' : ''
                }`}
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {message.user.name}
                </span>
                <div
                  className={`rounded-2xl px-4 py-2.5 shadow-lg transition-all hover:scale-[1.02] ${
                    message.userId === userId
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                      : 'bg-muted/50 backdrop-blur-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-primary/10"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type your message..."
            className="flex-1 rounded-full bg-muted/50 border-none focus-visible:ring-primary"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-primary/10"
              >
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-full p-0 rounded-xl border-none shadow-2xl" 
              sideOffset={5}
              align="end"
              style={{ width: 'auto' }}
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={320}
                height={400}
              />
            </PopoverContent>
          </Popover>
          <Button 
            type="submit" 
            size="icon"
            className="rounded-full hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ChatRoom