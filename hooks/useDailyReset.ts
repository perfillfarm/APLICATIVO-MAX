import { useEffect, useState } from 'react';

interface UseDailyResetOptions {
  onDayChange?: (newDate: string, oldDate: string) => void;
  checkInterval?: number; // in milliseconds
}

export const useDailyReset = (options: UseDailyResetOptions = {}) => {
  const { onDayChange, checkInterval = 60000 } = options; // Default: check every minute
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState(0);

  // Calculate time until midnight
  const calculateTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  };

  // Update time until midnight every minute
  useEffect(() => {
    const updateTimeUntilMidnight = () => {
      setTimeUntilMidnight(calculateTimeUntilMidnight());
    };

    updateTimeUntilMidnight();
    const interval = setInterval(updateTimeUntilMidnight, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check for day change
  useEffect(() => {
    const checkDateChange = () => {
      const newDate = new Date().toISOString().split('T')[0];
      if (newDate !== currentDate) {
        console.log(`📅 [useDailyReset] Day changed: ${currentDate} → ${newDate}`);
        const oldDate = currentDate;
        setCurrentDate(newDate);
        onDayChange?.(newDate, oldDate);
      }
    };

    // Check immediately
    checkDateChange();

    // Set up interval to check for date change
    const interval = setInterval(checkDateChange, checkInterval);

    // Also check when the page becomes visible (user returns to app)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkDateChange();
      }
    };

    const handleFocus = () => {
      checkDateChange();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentDate, onDayChange, checkInterval]);

  // Format time until midnight
  const formatTimeUntilMidnight = () => {
    const hours = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return {
    currentDate,
    timeUntilMidnight,
    formatTimeUntilMidnight,
    isNewDay: (lastDate: string) => currentDate !== lastDate,
  };
};