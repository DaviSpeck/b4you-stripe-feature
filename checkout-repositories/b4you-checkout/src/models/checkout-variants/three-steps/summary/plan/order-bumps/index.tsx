import React, { useEffect, useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";
import { OrderBumpsItem } from "./order-bump-item";

export const OrderBumps = () => {
  const { offerData } = useOfferData();

  if (!offerData || offerData.order_bumps.length === 0) return <></>;

  return (
    <div className="overflow-hidden rounded-[8px] border-[2px] border-dashed border-[#ff0000]">
      <h1 className="bg-gray-100 py-1 text-center">Ofertas especiais</h1>
      <div className="border-b-[1px] py-1.5">
        <OrderBumps.Timer />
      </div>
      <ul className="flex flex-col gap-2 p-0 px-6 py-2">
        {offerData.order_bumps
          .filter((ob) => ob.product.type !== "physical")
          .map((ob, i, arr) => {
            const lastItemIdex = arr.length - 1;
            return (
              <React.Fragment key={ob.uuid}>
                <OrderBumpsItem {...ob} />
                {lastItemIdex !== i && (
                  <div
                    className={cn("h-[1px] w-full bg-gray-300")}
                    {...(Boolean(offerData.checkout?.hex_color) && {
                      style: {
                        backgroundColor: offerData.checkout?.hex_color,
                      },
                    })}
                  />
                )}
              </React.Fragment>
            );
          })}
      </ul>
    </div>
  );
};

OrderBumps.Timer = function () {
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
      className={cn("flex w-full items-center justify-center gap-1")}
      {...(Boolean(offerData?.checkout?.hex_color) && {
        style: { color: String(offerData?.checkout?.hex_color) },
      })}
    >
      <FaRegClock />
      <p className="block text-[0.8rem] font-normal min-[800px]:text-[1rem]">
        Oferta termina em:{" "}
        <span className="font-semibold">{formatTime(timer)}</span>
      </p>
    </div>
  );
};
