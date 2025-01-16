import { Socket } from 'socket.io-client'
import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './providers/auth'
import { getGroupMessages } from '@/lib/group-api'
import { MessageCircle, Send, Smile, Paperclip, Users} from 'lucide-react'
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
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth()
  const userId = user?.id

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

  return (
    // Chat Container
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto rounded-lg border bg-background shadow-lg">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-full bg-primary/10">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Group Chat</h2>
            <p className="text-sm text-muted-foreground">
              {/* Display typing status */}
              {typingUsers.size > 0 ? (
                <span className="text-primary animate-pulse">
                  {Array.from(typingUsers).join(', ')} typing...
                </span>
              ) : (
                `${messages.length} messages`
              )}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Users className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-2 ${
                message.userId === userId ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.user.avatar} />
                <AvatarFallback>
                  {message.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col space-y-1 max-w-[70%] ${
                  message.userId === userId ? 'items-end' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{message.user.name}</span>
                </div>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.userId === userId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button type="button" variant="ghost" size="icon">
            <Paperclip className="w-5 h-5" />
          </Button>
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
              <Button type="button" variant="ghost" size="icon">
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-full p-0" 
              sideOffset={5}
              align="end"
              style={{ width: 'auto' }}
            >
              {/* Emoji Picker */}
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={320}
                height={400}
              />
            </PopoverContent>
          </Popover>
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ChatRoom