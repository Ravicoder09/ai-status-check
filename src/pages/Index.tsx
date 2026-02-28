import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BootSequence } from '@/components/BootSequence';
import { Sidebar } from '@/components/Sidebar';
import { ChatView } from '@/components/ChatView';
import { CodeSpace } from '@/components/CodeSpace';
import { initialRooms, users, initialFiles, Message, Room } from '@/lib/devsync-data';
import { Code } from 'lucide-react';

const Index = () => {
  const [booted, setBooted] = useState(false);
  const [view, setView] = useState<'chat' | 'code'>('chat');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState<Record<string, Room>>(initialRooms);

  const handleNewMessage = useCallback((msg: Message) => {
    setRooms((prev) => {
      const room = prev[currentRoom];
      // If AI message being updated (streaming), replace the last AI message
      const existingIdx = room.messages.findIndex((m) => m.id === msg.id);
      if (existingIdx >= 0) {
        const updated = [...room.messages];
        updated[existingIdx] = msg;
        return { ...prev, [currentRoom]: { ...room, messages: updated } };
      }
      return { ...prev, [currentRoom]: { ...room, messages: [...room.messages, msg] } };
    });
  }, [currentRoom]);

  const handleRoomSelect = (roomName: string) => {
    if (view === 'code') setView('chat');
    setCurrentRoom(roomName);
  };

  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />;
  }

  return (
    <motion.div
      className="h-screen flex overflow-hidden bg-background"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        users={users}
        aiStatus="online"
        onRoomSelect={handleRoomSelect}
        onCodeSpace={() => setView('code')}
      />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
        {view === 'chat' ? (
          <ChatView
            room={rooms[currentRoom]}
            users={users}
            onCodeSpace={() => setView('code')}
            onNewMessage={handleNewMessage}
          />
        ) : (
          <CodeSpace
            files={initialFiles}
            users={users}
            onBack={() => setView('chat')}
          />
        )}
      </main>

      {/* FAB for quick code space access */}
      {view === 'chat' && (
        <motion.button
          onClick={() => setView('code')}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_4px_20px_hsl(var(--primary)/0.4)] z-50 hover:scale-110 hover:rotate-90 transition-all"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Code className="w-6 h-6 text-primary-foreground" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default Index;
