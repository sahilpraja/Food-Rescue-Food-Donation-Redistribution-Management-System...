import React, { useState, useEffect } from 'react';
import { getTimeRemaining } from '../lib/utils';
import { Clock } from 'lucide-react';

export default function CountdownTag({ bestBefore }) {
  const [timeInfo, setTimeInfo] = useState(() => getTimeRemaining(bestBefore));

  useEffect(() => {
    // Tick every 10 seconds to update time remaining
    const timer = setInterval(() => {
      setTimeInfo(getTimeRemaining(bestBefore));
    }, 10000);
    return () => clearInterval(timer);
  }, [bestBefore]);

  let badgeClass = 'countdown-badge countdown-normal';
  if (timeInfo.urgency === 'warning') {
    badgeClass = 'countdown-badge countdown-warning';
  } else if (timeInfo.urgency === 'danger') {
    badgeClass = 'countdown-badge countdown-danger';
  } else if (timeInfo.isExpired) {
    badgeClass = 'countdown-badge';
  }

  return (
    <span className={badgeClass} title={`Best before: ${bestBefore}`}>
      <Clock size={12} />
      <span>{timeInfo.text}</span>
    </span>
  );
}
