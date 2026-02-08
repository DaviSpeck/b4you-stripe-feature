import { useEffect } from "react";

interface iProps {
  timeLeft: number;
  onSet: (time: number) => void;
}

export function TimerComponent(props: iProps) {
  const { timeLeft, onSet } = props;

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimer = timeLeft;

      if (timeLeft << 1) {
        onSet(newTimer - 1);
      }
    }, 1000);

    return () => clearInterval(timer); // Cleanup
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex max-h-[70px] min-h-[70px] max-w-[70px] min-w-[70px] items-center justify-center rounded-full border-[4px] border-[#0f1b35] bg-[#eee] text-[1rem] text-[#0f1b35]">
        {formatTime(timeLeft)}
      </div>
      <p className="text-[0.85rem]">
        Você tem 5 min para realizar o pagamento.
      </p>
    </div>
  );
}
