import Image from "next/image";
import { useEffect, useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";

export function HaderPage() {
  const { offerData } = useOfferData();

  if (!offerData) return <></>;

  const logoUrl = offerData?.product?.logo ?? "";

  return (
    <header className="flex flex-col items-center justify-start border-b shadow">
      <div
        className={
          "flex w-full max-w-[1220px] items-center justify-between px-8 py-4"
        }
      >
        {Boolean(logoUrl) ? (
          <Image src={logoUrl} width={100} height={50} quality={100} alt="" />
        ) : (
          <Image
            src={"/b4y-logo.png"}
            width={120}
            height={100}
            quality={100}
            alt=""
          />
        )}

        <div className="max-[800px]:opacity-0">
          <HaderPage.Timer />
        </div>

        <HaderPage.SecurityLabel />
      </div>
      {!offerData.counter && (
        <div className="w-full border-t py-4 min-[800px]:hidden">
          <HaderPage.Timer />
        </div>
      )}
    </header>
  );
}

HaderPage.SecurityLabel = function () {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center justify-center rounded-[4px] bg-[#20c37418] p-1">
        <IoShieldCheckmarkOutline className="text-[#20c374]" size={20} />
      </div>
      <div>
        <span className="block text-[0.625rem] font-bold text-[#20c374]">
          PAGAMENTO
        </span>
        <span className="block text-[0.625rem] font-bold text-[#20c374]">
          100% SEGURO
        </span>
      </div>
    </div>
  );
};

HaderPage.Timer = function () {
  const initialTime = 10 * 60;
  const [timer, setTimer] = useState<number>(initialTime);

  const { offerData } = useOfferData();

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (timer <= 0) return;

    const timerUpdate = setInterval(() => {
      setTimer((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerUpdate);
  }, [timer]);

  return (
    <div
      {...(Boolean(offerData?.checkout.hex_color) && {
        style: { color: String(offerData?.checkout.hex_color) },
      })}
      className={cn(
        "flex w-full items-center justify-center gap-1",
        offerData?.counter && "hidden",
      )}
    >
      <FaRegClock />
      <p className="block text-[0.8rem] font-normal min-[800px]:text-[1rem]">
        Oferta termina em:{" "}
        <span className="font-semibold">{formatTime(timer)}</span>
      </p>
    </div>
  );
};
