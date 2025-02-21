import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
}

const MessageContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2">{children}</p>,
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
        em: ({ children }) => <em className="italic text-primary/80">{children}</em>,
        code: ({ inline, className, children, ...props }: CodeProps) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              language={match[1]}
              style={vscDarkPlus as any}
              PreTag="div"
              className="rounded-md my-2"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-muted mb-4 px-1.5 py-0.5 rounded-md" {...props}>
              {children}
            </code>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export const AIChatDialog = ({ isOpen, onClose }: AIChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const api = import.meta.env.VITE_API_URL;

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
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${api}/api/chatbot/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials:"include",
        body: JSON.stringify({
          prompt: input,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent 
        className={`
          ${isMobile 
            ? 'w-[95%] h-[90%] max-w-none rounded-lg' 
            : 'w-[95%] max-w-[600px] h-[80vh] rounded-lg'
          }
          flex flex-col gap-0 p-0 z-[100] overflow-hidden top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] 
          border bg-background shadow-lg
        `}
      >
        <DialogHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AI Study Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by wise production</p>
              </div>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea 
          ref={scrollAreaRef} 
          className="flex-1 px-4 py-4 overflow-y-auto"
          style={{
            height: isMobile ? 'calc(90vh - 140px)' : 'calc(80vh - 140px)'
          }}
        >
          <div className="space-y-6 mb-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } ${message.role === "assistant" ? "mb-8" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2.5 max-w-[85%]  ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 mb-10"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <MessageContent content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap ">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 bg-primary p-2 rounded-full">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="bg-primary/10 p-2 rounded-full">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-muted/50 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="animate-bounce">⋅</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>⋅</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>⋅</span>
                  </div>
                  <span className="text-muted-foreground">Thinking</span>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSendMessage}
          className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-4 border-t bg-background/95 backdrop-blur-sm"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 