import { Room, User } from '@/lib/devsync-data';
import { Code, Hash, Plus } from 'lucide-react';

interface SidebarProps {
  rooms: Record<string, Room>;
  currentRoom: string;
  users: User[];
  aiStatus: 'online' | 'offline';
  onRoomSelect: (room: string) => void;
  onCodeSpace: () => void;
}

export function Sidebar({ rooms, currentRoom, users, aiStatus, onRoomSelect, onCodeSpace }: SidebarProps) {
  const onlineUsers = users.filter(u => u.status === 'online');

  return (
    <aside className="w-64 bg-sidebar border-r border-border flex flex-col h-full glass">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 cursor-pointer hover:translate-y-[-2px] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Code className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-foreground">
              DevSync<span className="text-primary">AI</span>
            </h1>
            <p className="text-xs text-muted-foreground">v2.4.0 Neural</p>
          </div>
        </div>
      </div>

      {/* User profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-devsync-emerald to-devsync-cyan flex items-center justify-center text-background font-bold shadow-lg">
              JD
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-devsync-emerald rounded-full border-2 border-sidebar status-dot" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Senior Developer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Code Space button */}
        <button
          onClick={onCodeSpace}
          className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 p-3 text-left transition-all hover:from-primary/30 hover:to-accent/30 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-primary">Code Space</p>
              <p className="text-xs text-muted-foreground">Collaborative Editor</p>
            </div>
          </div>
        </button>

        {/* Rooms */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channels</h3>
            <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {Object.values(rooms).map((room) => (
              <button
                key={room.name}
                onClick={() => onRoomSelect(room.name)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-all hover:bg-secondary group ${currentRoom === room.name ? 'room-active' : 'text-muted-foreground'}`}
              >
                <Hash className={`w-4 h-4 ${currentRoom === room.name ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${currentRoom === room.name ? 'text-foreground' : 'text-secondary-foreground group-hover:text-foreground'}`}>
                    {room.name}
                  </p>
                </div>
                {room.name === 'ai-lab' && (
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_hsl(var(--accent)/0.8)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Users */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Now</h3>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.name} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-${user.colorFrom} to-${user.colorTo} flex items-center justify-center text-xs font-bold text-background`}>
                    {user.avatar}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-devsync-emerald border-2 border-sidebar status-dot" />
                </div>
                <p className="text-sm font-medium text-secondary-foreground truncate">{user.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Status */}
      <div className="p-4 border-t border-border bg-sidebar/50">
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border ${aiStatus === 'online' ? 'border-primary/20' : 'border-destructive/20'} cursor-pointer group transition-colors`}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-sidebar ${aiStatus === 'online' ? 'bg-devsync-emerald animate-pulse' : 'bg-destructive'} status-dot`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">DevAssistant AI</p>
            <p className="text-xs text-muted-foreground">
              {aiStatus === 'online' ? 'Online • Ready' : 'Offline'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
