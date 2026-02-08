import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { MdOutlineTimer } from "react-icons/md";
import { iOffer } from "@/interfaces/offer";
import { hexWithOpacity } from "@/shared/hex-with-opacity";

interface iProps {
  offerData: iOffer;
}

export function Timer(props: iProps) {
  const [counter, setCounter] = useState<number | null>(null);
  const [percent, setPercent] = useState<number>(0);

  const { offerData } = props;

  function convertTime(seconds: number) {
    return new Date(seconds < 0 ? 0 : seconds * 1000)
      .toISOString()
      .slice(14, 19);
  }

  useEffect(() => {
    if (!counter && offerData.counter) {
      setCounter(offerData.counter.seconds);
    }
  }, [offerData]);

  useEffect(() => {
    if (counter === null || counter === undefined) return;

    if (percent === 100) return;

    setTimeout(() => setCounter((prevValue) => prevValue! - 1), 1000);

    const percentCounter = Math.min(
      (counter / offerData.counter.seconds) * 100,
      100,
    );

    setPercent(counter === 0 ? 100 : 100 - percentCounter);
  }, [counter]);

  if (counter === null || counter === undefined || !offerData.counter)
    return <></>;

  return (
    <div
      className="sticky top-0 z-30 bg-[#ec7c7c]"
      {...(offerData.counter.color && {
        style: {
          background: hexWithOpacity(offerData.counter.color, 0.6),
        },
      })}
    >
      <div className="h-full">
        <motion.div
          className="h-full bg-[#df2424] py-7"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "linear" }}
          {...(offerData.counter.color && {
            style: { backgroundColor: offerData.counter.color },
          })}
        />
      </div>
      <div className="absolute top-0 flex h-full w-full flex-wrap items-center justify-center">
        <p className="max-w-[80%] overflow-hidden px-3 text-[1.5rem] font-normal text-ellipsis whitespace-nowrap text-white max-[550px]:text-[1rem]">
          {counter > 0
            ? `${offerData.counter.label || "Essa é a sua única chance!"}`
            : `${offerData.counter.label_end || "O tempo acabou."}`}
        </p>
        <div className="flex items-center gap-1 text-[1.5rem] text-white max-[550px]:text-[1rem]">
          <span className="block">{convertTime(counter)}</span>
          <MdOutlineTimer className="text-[1.875rem] max-[550px]:text-[1.2rem]" />
        </div>
      </div>
    </div>
  );
}
