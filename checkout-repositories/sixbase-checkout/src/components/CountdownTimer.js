import { useState, useEffect } from 'react';

const CountdownTimer = ({
  initialSeconds = 599, // padrão: 9min59s
  label = 'Oferta termina em...',
  label_end = 'O tempo acabou.',
  onEnd = () => {}, // callback opcional
}) => {
  const [counter, setCounter] = useState(initialSeconds);

  useEffect(() => {
    if (counter <= 0) {
      onEnd();
      return;
    }

    const timer = setTimeout(() => {
      setCounter(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [counter]);

  const convertTime = (seconds) => {
    return new Date(seconds * 1000).toISOString().slice(14, 19); // MM:SS
  };

  return (
    <>
      <span>{counter > 0 ? label : label_end}</span>
      <span style={{ marginLeft: '8px' }}>{convertTime(counter)}</span>
    </>
  );
};

export default CountdownTimer;
