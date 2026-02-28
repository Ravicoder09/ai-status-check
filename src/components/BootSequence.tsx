import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { bootTexts } from '@/lib/devsync-data';

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<'boot' | 'logo' | 'done'>('boot');
  const [currentLine, setCurrentLine] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== 'boot') return;
    const interval = setInterval(() => {
      setCurrentLine((prev) => {
        const next = prev + 1;
        setProgress((next / bootTexts.length) * 100);
        if (next >= bootTexts.length) {
          clearInterval(interval);
          setTimeout(() => setPhase('logo'), 500);
        }
        return next;
      });
    }, 350);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === 'logo') {
      setTimeout(() => {
        setPhase('done');
        setTimeout(onComplete, 600);
      }, 2200);
    }
  }, [phase, onComplete]);

  // Matrix rain columns
  const matrixCols = Array.from({ length: 20 }, (_, i) => ({
    left: `${i * 5}%`,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 5,
    chars: Array.from({ length: 20 }, () => String.fromCharCode(0x30a0 + Math.random() * 96)).join(''),
  }));

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <>
          {/* Boot screen */}
          <AnimatePresence>
            {phase === 'boot' && (
              <motion.div
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background font-mono"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Matrix background */}
                <div className="absolute inset-0 overflow-hidden opacity-5">
                  {matrixCols.map((col, i) => (
                    <div
                      key={i}
                      className="absolute text-primary text-sm leading-[14px]"
                      style={{
                        left: col.left,
                        top: '-100%',
                        writingMode: 'vertical-rl',
                        textOrientation: 'upright',
                        animation: `matrixRain ${col.duration}s linear ${col.delay}s infinite`,
                      }}
                    >
                      {col.chars}
                    </div>
                  ))}
                </div>

                {/* Scanlines */}
                <div className="scanlines" />

                <div className="max-w-md w-full px-8 space-y-4 relative z-20">
                  <div className="space-y-1 text-xs md:text-sm">
                    {bootTexts.slice(0, currentLine).map((text, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-primary"
                      >
                        {'> '}{text}
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 h-1 rounded-full overflow-hidden bg-secondary">
                    <motion.div
                      className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.8)]"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>{currentLine < bootTexts.length ? bootTexts[currentLine] || 'Initializing...' : 'Complete'}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logo screen */}
          <AnimatePresence>
            {phase === 'logo' && (
              <motion.div
                className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--devsync-blue)/0.1),_hsl(var(--background))_70%)]" />
                <div className="scanlines" />

                <motion.div
                  className="relative z-10 flex flex-col items-center gap-8"
                  initial={{ scale: 0.8, y: 20, filter: 'blur(10px)' }}
                  animate={{ scale: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-primary via-accent to-devsync-pink flex items-center justify-center shadow-[0_0_60px_hsl(var(--primary)/0.5)]"
                    style={{ animation: 'pulse-glow 2s infinite' }}
                  >
                    <svg className="w-12 h-12 md:w-16 md:h-16 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>

                  <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                      <span className="gradient-text">DevSync</span>
                    </h1>
                    <motion.p
                      className="text-muted-foreground text-sm md:text-base tracking-widest uppercase"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Neural Code Collaboration
                    </motion.p>
                  </div>

                  <div className="flex gap-2">
                    {[0, 0.1, 0.2].map((delay, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-accent' : 'bg-devsync-pink'} animate-bounce`}
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
