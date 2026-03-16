import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserContext {
  name: string | null;
  email: string;
  subjects: string[];
  package: string | null;
  quizStats: {
    totalAttempts: number;
    avgScore: number;
  } | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export const ChatBot = () => {
  const { user, userPackage, hasAccess } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch user context on mount
  useEffect(() => {
    const fetchUserContext = async () => {
      if (!user?.email) return;

      try {
        // Fetch user subjects and quiz stats in parallel
        const [subjectsRes, quizRes, profileRes] = await Promise.all([
          supabase.from('user_subjects').select('subjects').eq('email', user.email).maybeSingle(),
          supabase.from('quiz_attempts').select('correct_answers, total_questions').eq('email', user.email),
          supabase.from('profiles').select('full_name').eq('email', user.email).maybeSingle()
        ]);

        const subjects = subjectsRes.data?.subjects || [];
        const quizData = quizRes.data || [];
        
        let quizStats = null;
        if (quizData.length > 0) {
          const totalCorrect = quizData.reduce((sum, q) => sum + q.correct_answers, 0);
          const totalQuestions = quizData.reduce((sum, q) => sum + q.total_questions, 0);
          quizStats = {
            totalAttempts: quizData.length,
            avgScore: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
          };
        }

        setUserContext({
          name: profileRes.data?.full_name || user.user_metadata?.full_name || null,
          email: user.email,
          subjects: subjects as string[],
          package: userPackage,
          quizStats
        });

        // Set initial greeting with user context
        const greeting = profileRes.data?.full_name || user.user_metadata?.full_name 
          ? `Hi ${(profileRes.data?.full_name || user.user_metadata?.full_name).split(' ')[0]}! 👋`
          : "Hi there! 👋";
        
        setMessages([{ 
          role: 'assistant', 
          content: `${greeting} I'm your JAMB AI study assistant. I know you're studying ${subjects.length > 0 ? subjects.join(', ') : 'for JAMB'}. Ask me anything about your subjects, study tips, or let me quiz you!` 
        }]);
      } catch (error) {
        console.error('Error fetching user context:', error);
        setMessages([{ 
          role: 'assistant', 
          content: "Hi! 👋 I'm your JAMB AI study assistant. Ask me anything about your subjects, study tips, or practice questions!" 
        }]);
      }
    };

    fetchUserContext();
  }, [user?.email, userPackage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Hide on auth page
  if (!user || location.pathname === '/auth') return null;

  const streamChat = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
        userContext: userContext
      }),
    });

    if (!resp.ok || !resp.body) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(newMessages.filter(m => m.role === 'user' || (m.role === 'assistant' && messages.indexOf(m) > 0)));
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "📚 Give me a study tip",
    "🧠 Quiz me on my subjects",
    "📊 How should I prepare?"
  ];

  return (
    <>
      {/* Chat Button - Always visible on both desktop and mobile */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-50 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-300 hover:scale-110",
          "flex items-center gap-2",
          isMobile ? "bottom-20 right-4 h-12 w-12" : "bottom-6 right-6 h-14 px-4",
          isOpen && "hidden"
        )}
      >
        <Sparkles className="h-5 w-5" />
        {!isMobile && <span className="font-medium">Ask AI</span>}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className={cn(
          "fixed z-50 bg-card border border-border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300",
          isMobile 
            ? "inset-0 rounded-none" 
            : "bottom-6 right-6 w-[380px] h-[520px] max-h-[80vh] rounded-2xl"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">JAMB AI Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {userContext?.subjects?.length ? `Helping with ${userContext.subjects.length} subjects` : 'Your study buddy'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' && "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    message.role === 'assistant' 
                      ? "bg-gradient-to-br from-primary to-primary/60" 
                      : "bg-secondary"
                  )}>
                    {message.role === 'assistant' ? (
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-secondary-foreground" />
                    )}
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.role === 'assistant' 
                      ? "bg-muted text-foreground rounded-tl-sm" 
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  )}>
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-background/50">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about JAMB..."
                disabled={isLoading}
                className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-full h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
