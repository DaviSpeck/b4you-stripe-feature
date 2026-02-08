import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { useOfferCoupon, useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";
import { Card } from "@/components/ui/card";

interface iProps {
  orderBumpUuid: string;
  amount: number;
}

export function OrderBumpsItem(props: iProps) {
  const [prevOfferPrice, setPrevOfferPrice] = useState<number>(0);

  const { orderBumpUuid, amount } = props;

  const { offerData } = useOfferData();
  const { paymentSelected } = useOfferPayment();
  const { discountValue } = useOfferCoupon();

  if (!paymentSelected || !offerData) return <></>;

  const orderBump = offerData.order_bumps.find(
    (ob) => ob.uuid === orderBumpUuid,
  );

  if (!orderBump) return <></>;

  const orderBumpImage = orderBump.alternative_image ?? orderBump.product.cover;
  const orderBumpName = orderBump.product.name;

  const price = orderBump.price;

  return (
    <Card className="flex h-fit flex-col gap-4 border-none p-4">
      <div className="flex items-center gap-2.5">
        <div className="w-fit rounded-[8px] border object-fill p-[10px]">
          {Boolean(orderBumpImage) && (
            <Image
              src={orderBumpImage}
              width={50}
              height={50}
              alt=""
              quality={80}
              unoptimized
            />
          )}
        </div>
        <div className="w-full max-w-full gap-2 overflow-hidden">
          <span className="block w-full overflow-hidden text-[0.775rem] font-medium text-ellipsis whitespace-nowrap min-[1200px]:w-[200px]">
            {orderBumpName}
          </span>
          {Boolean(orderBump.description) && (
            <span className="line-clamp-2 block w-full text-[0.775rem] font-medium break-words text-ellipsis text-[#9e9e9e] min-[1200px]:max-w-[200px]">
              {orderBump.description}
            </span>
          )}
          <div>
            <p className="text-[0.775rem]">
              {price < orderBump.price_before && (
                <span className="pr-1 font-semibold">De:</span>
              )}
              <span
                className={cn(
                  "text-[0.75rem] text-[#3f3f3f]",
                  price < orderBump.price_before &&
                    "text-[#A9A9A9] line-through",
                )}
              >
                {(orderBump.price_before * amount)?.toLocaleString("pt-br", {
                  currency: "BRL",
                  style: "currency",
                })}
              </span>
            </p>
            {(discountValue || price < orderBump.price_before) && (
              <motion.div
                key={uuid()}
                initial={
                  orderBump.price_before !== prevOfferPrice
                    ? { opacity: 0, y: -10 }
                    : false
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onAnimationComplete={() => {
                  setPrevOfferPrice(price!);
                }}
              >
                <p className="text-[0.75rem]">
                  <span className="pr-1 font-semibold">Por:</span>
                  <span className="3F3F3F">
                    {(price * amount)?.toLocaleString("pt-br", {
                      currency: "BRL",
                      style: "currency",
                    })}
                  </span>
                </p>
              </motion.div>
            )}
          </div>
          <p className="text-[0.75rem]">
            <span className="pr-0.5 font-semibold">Quantidade:</span>{" "}
            <span className="#3F3F3F">{amount} un.</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
