import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeFile, User } from '@/lib/devsync-data';
import { streamChat } from '@/lib/ai-stream';
import { Play, Trash2, X, Send } from 'lucide-react';
import { toast } from 'sonner';

interface CodeSpaceProps {
  files: CodeFile[];
  users: User[];
  onBack: () => void;
}

export function CodeSpace({ files, users, onBack }: CodeSpaceProps) {
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [fileContents, setFileContents] = useState<string[]>(files.map((f) => f.content));
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'DevSync Code Space v1.0.0',
    '➜ Ready for collaboration. Start coding or invite team members.',
  ]);
  const [aiMessages, setAiMessages] = useState<Array<{ text: string; type: string }>>([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = files[activeFileIdx];
  const lineCount = fileContents[activeFileIdx].split('\n').length;
  const onlineUsers = users.filter((u) => u.status === 'online');

  const handleRun = () => {
    const ts = new Date().toLocaleTimeString();
    setTerminalOutput((prev) => [
      ...prev,
      `[${ts}] Running ${activeFile.name}...`,
      'Compiling modules...',
      '✓ Build successful in 1.2s',
      `Server running at http://localhost:3000`,
      "⚠ Warning: useEffect has missing dependency: 'fetchData'",
    ]);
  };

  const handleAskAI = async () => {
    const q = aiInput.trim();
    if (!q || isAiLoading) return;

    setAiMessages((prev) => [...prev, { text: q, type: 'user' }]);
    setAiInput('');
    setIsAiLoading(true);

    let aiText = '';
    setAiMessages((prev) => [...prev, { text: '...', type: 'ai' }]);

    try {
      await streamChat({
        type: 'code-assist',
        code: fileContents[activeFileIdx],
        language: activeFile.language,
        question: q,
        onDelta: (chunk) => {
          aiText += chunk;
          setAiMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { text: aiText, type: 'ai' };
            return updated;
          });
        },
        onDone: () => setIsAiLoading(false),
      });
    } catch (err) {
      setIsAiLoading(false);
      toast.error(err instanceof Error ? err.message : 'AI error');
      setAiMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { text: '⚠️ Failed to get response', type: 'error' };
        return updated;
      });
    }
  };

  return (
    <div className="flex-1 flex h-full bg-devsync-editor">
      {/* File sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-foreground">Explorer</h3>
          </div>
          <div className="space-y-1">
            {files.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => setActiveFileIdx(idx)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg cursor-pointer transition-all text-sm font-mono ${
                  idx === activeFileIdx
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'hover:bg-secondary text-muted-foreground'
                }`}
              >
                {file.name}
                {idx === activeFileIdx && <div className="w-2 h-2 rounded-full bg-primary ml-auto shadow-[0_0_8px_hsl(var(--primary)/0.8)]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Collaborators */}
        <div className="flex-1 p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Collaborators</h4>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-${user.colorFrom} to-${user.colorTo} flex items-center justify-center text-xs font-bold text-background`}>
                    {user.avatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-devsync-emerald border-2 border-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Run button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleRun}
            className="w-full py-2.5 rounded-lg bg-devsync-emerald/20 text-devsync-emerald border border-devsync-emerald/30 hover:bg-devsync-emerald/30 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Play className="w-4 h-4" />
            Run Code
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <div className="flex bg-card border-b border-border overflow-x-auto">
          {files.map((file, idx) => (
            <button
              key={file.name}
              onClick={() => setActiveFileIdx(idx)}
              className={`px-4 py-3 flex items-center gap-2 cursor-pointer border-r border-border min-w-fit text-xs font-mono ${
                idx === activeFileIdx
                  ? 'bg-devsync-editor text-foreground border-t-2 border-t-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {file.name}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={onBack} className="px-3 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code editor area */}
        <div className="flex-1 flex relative overflow-hidden">
          <div className="py-4 pl-4 pr-4 text-right select-none bg-devsync-editor text-muted-foreground font-mono text-sm leading-relaxed border-r border-border">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className={i === 0 ? 'text-primary' : ''}>{i + 1}</div>
            ))}
          </div>
          <textarea
            ref={editorRef}
            value={fileContents[activeFileIdx]}
            onChange={(e) => {
              const newContents = [...fileContents];
              newContents[activeFileIdx] = e.target.value;
              setFileContents(newContents);
            }}
            spellCheck={false}
            className="flex-1 bg-devsync-editor text-foreground font-mono text-sm leading-relaxed p-4 resize-none focus:outline-none"
            style={{ tabSize: 2 }}
          />
        </div>

        {/* Terminal */}
        <div className="h-48 bg-background border-t border-border flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">Terminal</span>
            <button onClick={() => setTerminalOutput(['➜ Terminal cleared'])} className="p-1 rounded hover:bg-secondary text-muted-foreground">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto text-secondary-foreground">
            {terminalOutput.map((line, i) => (
              <div key={i} className={
                line.startsWith('✓') ? 'text-devsync-emerald' :
                line.startsWith('⚠') ? 'text-devsync-amber' :
                line.includes('Running') ? 'text-primary' :
                'text-secondary-foreground'
              }>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Code Assistant Panel */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Code Assistant</h3>
              <p className="text-xs text-muted-foreground">Context-aware help</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground">
            <p className="mb-2">💡 <span className="text-foreground font-medium">Tip:</span> Ask me about your code!</p>
            <p>I can analyze, debug, and optimize your code in real-time.</p>
          </div>
          {aiMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm ${
                msg.type === 'user'
                  ? 'bg-secondary ml-8 text-foreground'
                  : msg.type === 'error'
                  ? 'bg-destructive/10 border border-destructive/30 text-destructive mr-8'
                  : 'bg-primary/10 border border-primary/30 text-foreground mr-8'
              }`}
            >
              {msg.type === 'ai' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <div className="relative">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              placeholder="Ask about your code..."
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder-muted-foreground"
            />
            <button
              onClick={handleAskAI}
              disabled={isAiLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

