// DevSync AI state types and data

export interface Message {
  id: number;
  user: string;
  avatar: string;
  colorFrom: string;
  colorTo: string;
  text: string;
  timestamp: string;
  type: 'text' | 'ai';
}

export interface Room {
  name: string;
  description: string;
  members: number;
  messages: Message[];
}

export interface User {
  name: string;
  avatar: string;
  colorFrom: string;
  colorTo: string;
  status: 'online' | 'away' | 'offline';
  activity: string;
}

export interface CodeFile {
  name: string;
  language: string;
  content: string;
}

export const initialRooms: Record<string, Room> = {
  general: {
    name: 'general',
    description: 'General discussion',
    members: 12,
    messages: [
      {
        id: 1,
        user: 'Sarah Chen',
        avatar: 'SC',
        colorFrom: 'devsync-pink',
        colorTo: 'destructive',
        text: 'Hey team, has anyone encountered the new React 19 compiler issues?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'text',
      },
      {
        id: 2,
        user: 'Mike Ross',
        avatar: 'MR',
        colorFrom: 'devsync-amber',
        colorTo: 'devsync-amber',
        text: "Yeah, I'm getting weird hydration mismatches. @AI can you help debug this?",
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        type: 'text',
      },
    ],
  },
  frontend: { name: 'frontend', description: 'Frontend development', members: 8, messages: [] },
  backend: { name: 'backend', description: 'Backend architecture', members: 6, messages: [] },
  'ai-lab': { name: 'ai-lab', description: 'AI experiments', members: 15, messages: [] },
  debugging: { name: 'debugging', description: 'Bug hunting', members: 4, messages: [] },
};

export const users: User[] = [
  { name: 'John Doe', avatar: 'JD', colorFrom: 'devsync-emerald', colorTo: 'devsync-cyan', status: 'online', activity: 'Coding in Code Space' },
  { name: 'Sarah Chen', avatar: 'SC', colorFrom: 'devsync-pink', colorTo: 'destructive', status: 'online', activity: 'Reviewing PR #234' },
  { name: 'Mike Ross', avatar: 'MR', colorFrom: 'devsync-amber', colorTo: 'devsync-amber', status: 'away', activity: 'Away' },
  { name: 'Emma Wilson', avatar: 'EW', colorFrom: 'accent', colorTo: 'devsync-purple', status: 'online', activity: 'Debugging API' },
  { name: 'Alex Kumar', avatar: 'AK', colorFrom: 'devsync-blue', colorTo: 'primary', status: 'offline', activity: 'Offline' },
];

export const initialFiles: CodeFile[] = [
  {
    name: 'App.jsx',
    language: 'javascript',
    content: `import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  
  // AI: Potential issue here - missing dependency
  useEffect(() => {
    fetchData();
  }, []); 
  
  const fetchData = async () => {
    const res = await fetch('/api/data');
    const json = await res.json();
    setData(json);
  };
  
  return (
    <div className="app">
      <h1>DevSync Dashboard</h1>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export default App;`,
  },
  {
    name: 'styles.css',
    language: 'css',
    content: `.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}`,
  },
  {
    name: 'api.js',
    language: 'javascript',
    content: `export const fetchUser = async (id) => {
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error('User not found');
  }
  return response.json();
};`,
  },
];

export const bootTexts = [
  "Initializing neural interface...",
  "Loading DevSync kernel modules...",
  "Establishing secure connection...",
  "Mounting virtual file system...",
  "Synchronizing with cloud instances...",
  "Activating AI assistant core...",
  "Calibrating syntax highlighters...",
  "Ready to launch.",
];
