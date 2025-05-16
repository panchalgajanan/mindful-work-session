
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 60) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s` 
      : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

export const getDateRangeLabel = (days: number): string => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - days);
  
  return `${formatDateMonthDay(pastDate)} - ${formatDateMonthDay(today)}`;
};

export const formatDateMonthDay = (date: Date): string => {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString(undefined, { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

// Helper function to parse date strings consistently
export const parseDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // Try to parse the date
  const parsed = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(parsed.getTime())) {
    console.error("Invalid date string:", dateString);
    return new Date(); // Return current date as fallback
  }
  
  return parsed;
};
