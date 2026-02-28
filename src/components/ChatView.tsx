import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Message, Room, User } from '@/lib/devsync-data';
import { streamChat, ChatMessage } from '@/lib/ai-stream';
import { Code, Send, Paperclip, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface ChatViewProps {
  room: Room;
  users: User[];
  onCodeSpace: () => void;
  onNewMessage: (msg: Message) => void;
}

export function ChatView({ room, users, onCodeSpace, onNewMessage }: ChatViewProps) {
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [room.messages, isAiTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    const hasAIMention = text.toLowerCase().includes('@ai');

    const userMsg: Message = {
      id: Date.now(),
      user: 'John Doe',
      avatar: 'JD',
      colorFrom: 'devsync-emerald',
      colorTo: 'devsync-cyan',
      text,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    onNewMessage(userMsg);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    if (hasAIMention) {
      setIsAiTyping(true);
      const newHistory: ChatMessage[] = [...conversationHistory, { role: 'user', content: text }];
      
      let aiText = '';
      const aiMsg: Message = {
        id: Date.now() + 1,
        user: 'DevAssistant AI',
        avatar: 'AI',
        colorFrom: 'primary',
        colorTo: 'accent',
        text: '',
        timestamp: new Date().toISOString(),
        type: 'ai',
      };

      onNewMessage(aiMsg);

      try {
        await streamChat({
          messages: [
            ...newHistory,
          ],
          onDelta: (chunk) => {
            aiText += chunk;
            aiMsg.text = aiText;
            // Force re-render by creating new message reference
            onNewMessage({ ...aiMsg, text: aiText });
          },
          onDone: () => {
            setIsAiTyping(false);
            setConversationHistory([...newHistory, { role: 'assistant', content: aiText }]);
          },
        });
      } catch (err) {
        setIsAiTyping(false);
        toast.error(err instanceof Error ? err.message : 'Failed to get AI response');
        aiMsg.text = '⚠️ Failed to get response. Please try again.';
        onNewMessage({ ...aiMsg });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out 3s infinite' }} />
      </div>

      {/* Header */}
      <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
            <span className="text-muted-foreground">#</span>
            <span>{room.name}</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground border border-border">
            {room.members} members
          </span>
          <div className="flex -space-x-2">
            {users.slice(0, 3).map((u) => (
              <div
                key={u.name}
                className={`w-8 h-8 rounded-full bg-gradient-to-br from-${u.colorFrom} to-${u.colorTo} flex items-center justify-center text-xs font-bold text-background border-2 border-card shadow-lg`}
                title={u.name}
              >
                {u.avatar}
              </div>
            ))}
            {users.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground border-2 border-card">
                +{users.length - 3}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onCodeSpace}
          className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Code className="w-4 h-4" />
          Code Space
        </button>
      </header>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth relative z-0">
        {room.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center border border-border">
              <MessageSquare className="w-10 h-10 opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground mb-1">No messages yet</p>
              <p className="text-sm text-muted-foreground/60">Start the conversation or ask @AI for help</p>
            </div>
          </div>
        ) : (
          room.messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.3) }}
              className={`flex gap-4 ${msg.type === 'ai' ? 'mb-6' : 'mb-4 hover:bg-card/30 p-2 rounded-xl transition-colors'}`}
            >
              <div className="flex-shrink-0">
                {msg.type === 'ai' ? (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20" style={{ animation: isAiTyping && idx === room.messages.length - 1 ? 'pulse-glow 2s infinite' : undefined }}>
                    <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${msg.colorFrom} to-${msg.colorTo} flex items-center justify-center text-background font-bold text-sm shadow-lg`}>
                    {msg.avatar}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold ${msg.type === 'ai' ? 'text-primary' : 'text-foreground'}`}>
                    {msg.user}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                  {msg.type === 'ai' && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-xs border border-primary/30 font-mono">
                      BOT
                    </span>
                  )}
                </div>
                {msg.type === 'ai' ? (
                  <div className="ai-message rounded-2xl rounded-tl-none p-4">
                    <div className="text-sm text-secondary-foreground leading-relaxed prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.text || '...'}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-secondary-foreground leading-relaxed">
                    {msg.text.split(/@(AI|ai)/g).map((part, i) =>
                      part.toLowerCase() === 'ai' ? (
                        <span key={i} className="text-primary bg-primary/10 px-1.5 py-0.5 rounded-md font-medium">
                          @AI
                        </span>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isAiTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-muted-foreground px-2"
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full typing-dot" />
                <div className="w-2 h-2 bg-accent rounded-full typing-dot" />
                <div className="w-2 h-2 bg-devsync-pink rounded-full typing-dot" />
              </div>
              <span className="font-mono text-xs">DevAssistant AI is thinking...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/80 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2 bg-secondary rounded-xl border border-border p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-lg">
            <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-0 resize-none max-h-32 py-2.5 px-2 text-sm focus:outline-none text-foreground placeholder-muted-foreground font-mono"
              placeholder="Type a message... Use @AI for help"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground px-2">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">@AI</kbd>
              <span>invoke assistant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">Shift+Enter</kbd>
              <span>new line</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
