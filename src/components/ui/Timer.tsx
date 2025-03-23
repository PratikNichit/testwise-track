
import { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerProps {
  duration: number; // in minutes
  onTimeEnd: () => void;
  className?: string;
}

const Timer = ({ duration, onTimeEnd, className }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  
  // Format time to display
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const pad = (num: number) => String(num).padStart(2, '0');
    
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    }
    
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  }, []);
  
  useEffect(() => {
    // Check if timer should be in warning state (less than 20% of total time)
    if (timeLeft <= duration * 60 * 0.2 && timeLeft > duration * 60 * 0.1) {
      setIsWarning(true);
      setIsCritical(false);
    } 
    // Check if timer should be in critical state (less than 10% of total time)
    else if (timeLeft <= duration * 60 * 0.1) {
      setIsWarning(false);
      setIsCritical(true);
    } else {
      setIsWarning(false);
      setIsCritical(false);
    }
  }, [timeLeft, duration]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onTimeEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [onTimeEnd]);
  
  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-3 rounded-md text-foreground transition-all duration-300",
        isWarning && "bg-warning/10 text-warning animate-pulse",
        isCritical && "bg-destructive/10 text-destructive animate-pulse-light",
        !isWarning && !isCritical && "bg-primary/10 text-primary",
        className
      )}
    >
      {isCritical ? (
        <AlertTriangle size={18} className="animate-pulse" />
      ) : (
        <Clock size={18} />
      )}
      <span className="font-mono font-medium text-lg">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default Timer;
