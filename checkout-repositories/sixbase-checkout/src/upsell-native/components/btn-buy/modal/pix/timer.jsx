import { useEffect, useState } from 'react';
import './style.scss';

const DEFAULT_DURATION = 5 * 60; // 5 minutos em segundos

export function TimerComponent({ duration = DEFAULT_DURATION }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  const minutes = Math.floor(duration / 60);

  return (
    <div className='wrapper-timer'>
      <div className='couter-timer'>{formatTime(timeLeft)}</div>
      <p className='text-[0.85rem]'>
        Você tem {minutes} min para realizar o pagamento.
      </p>
    </div>
  );
}