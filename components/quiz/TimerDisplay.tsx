'use client';

import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface TimerDisplayProps {
  initialMinutes: number;
  onTimeUp: () => void;
  isPaused?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ initialMinutes, onTimeUp, isPaused = false }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isPaused, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = (secondsLeft / (initialMinutes * 60)) * 100;
  const isUrgent = secondsLeft < 60; // Less than 1 minute

  return (
    <div className="glass-panel p-4 flex items-center justify-between sticky top-4 z-50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isUrgent ? 'bg-danger/10 text-danger' : 'bg-brand-subtle text-brand-light'}`}>
          <Timer size={20} className={isUrgent ? 'animate-pulse' : ''} />
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase font-bold tracking-widest">Time Remaining</p>
          <p className={`text-xl font-mono font-bold ${isUrgent ? 'text-danger' : 'text-text-primary'}`}>
            {formatTime(secondsLeft)}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-[200px] ml-6 hidden md:block">
        <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${isUrgent ? 'bg-danger' : 'bg-brand-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
