import { useEffect, useState } from 'react';

const TimerPix = ({ initialMinutes = 0, initialSeconds = 0 }) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const totalSecondsNow = minutes * 60 + seconds;
  const totalSeconds = initialMinutes * 60 + initialSeconds;

  let numberWord = 'minutos';
  if (totalSeconds < 60) {
    numberWord = 'segundos';
  } else if (totalSeconds === 60) {
    numberWord = 'minuto';
  }

  let verifyTimer = true;

  if (initialMinutes + initialSeconds <= 0) {
    verifyTimer = false;
  } else if (minutes + seconds <= 0) {
    verifyTimer = false;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
      if (seconds <= 0) {
        setMinutes((prevMinutes) => prevMinutes - 1);
        setSeconds(59);
      }
    }, 1000);
    if (seconds <= 0 && minutes <= 0) {
      return clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [minutes, seconds]);

  return (
    <>
      {verifyTimer ? (
        <div className='mt-3' style={{ fontSize: 14 }}>
          Você tem {initialMinutes || initialSeconds} {numberWord} para efetuar
          o pagamento.
        </div>
      ) : (
        <div className='mt-3' style={{ fontSize: 14 }}>
          Seu tempo de compra expirou.
        </div>
      )}

      {verifyTimer ? (
        <div className='w-100 text-left mt-3' style={{ fontSize: 16 }}>
          Tempo restante: {minutes}:{seconds < 10 ? '0' + seconds : seconds}
        </div>
      ) : (
        <div
          className='w-100 text-left mt-3'
          style={{ fontSize: 16, color: '#ff0000' }}
        >
          Tempo expirado
        </div>
      )}

      {verifyTimer ? (
        <div
          className='progress mt-2'
          style={{
            width: '100%',
            height: '10px',
            borderRadius: 4,
          }}
        >
          <div
            className='progress-bar'
            role='progressbar'
            aria-valuenow={totalSecondsNow}
            aria-valuemin='0'
            aria-valuemax={totalSeconds}
            style={{
              width: (totalSecondsNow / totalSeconds) * 100 + '%',
              backgroundColor: '#ff0000',
            }}
          ></div>
        </div>
      ) : (
        <div
          className='mt-2'
          style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#ff0000',
            borderRadius: 4,
          }}
        ></div>
      )}
    </>
  );
};

export default TimerPix;
