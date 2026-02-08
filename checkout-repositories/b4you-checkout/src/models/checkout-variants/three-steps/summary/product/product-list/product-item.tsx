import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { iOffer } from "@/interfaces/offer";
import { cn } from "@/shared/libs/cn";
import { Card } from "@/components/ui/card";

interface iProps {
  image: string | null;
  title: string;
  description: string | null;
  discount: number;
  price: number;
  priceWithDiscount: number | null;
  type: iOffer["product"]["type"];
  quantity?: number;
}

export function ProductItem(props: iProps) {
  const [prevPrice, setPrevPrice] = useState<number>(0);

  const {
    image,
    description,
    title,
    discount,
    price,
    quantity,
    priceWithDiscount,
    type,
  } = props;

  return (
    <Card className="flex h-fit flex-col gap-4 border-none p-4">
      <div className="flex items-center gap-4">
        {Boolean(image) && (
          <Image
            src={image!}
            alt=""
            width={80}
            height={80}
            quality={100}
            className="rounded-[8px]"
          />
        )}
        <div className="w-full max-w-full gap-2 overflow-hidden">
          <span className="block w-full overflow-hidden pb-1 text-[0.875rem] font-medium text-ellipsis min-[1200px]:w-[200px]">
            {title}
          </span>

          <div>
            <p className="text-[0.75rem]">
              {discount > 0 && <span className="pr-1 font-semibold">De:</span>}
              <span
                className={cn(
                  "text-[0.75rem] text-[#3f3f3f]",
                  discount > 0 && "text-[#A9A9A9] line-through",
                )}
              >
                {price?.toLocaleString("pt-br", {
                  currency: "BRL",
                  style: "currency",
                })}
              </span>
            </p>
            {discount > 0 && (
              <motion.div
                initial={price !== prevPrice ? { opacity: 0, y: -10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onAnimationComplete={() => {
                  setPrevPrice(price!);
                }}
              >
                <p className="text-[0.75rem]">
                  <span className="pr-1 font-semibold">Por:</span>
                  <span className="3F3F3F">
                    {priceWithDiscount?.toLocaleString("pt-br", {
                      currency: "BRL",
                      style: "currency",
                    })}
                  </span>
                </p>
              </motion.div>
            )}
          </div>
          {type === "physical" && Boolean(quantity) && (
            <p className="text-[0.75rem]">
              <span className="pr-0.5 font-semibold">Quantidade:</span>{" "}
              <span className="3F3F3F">{quantity} un.</span>
            </p>
          )}
        </div>
      </div>
      {Boolean(description) && (
        <span className="block w-full text-[0.75rem] font-medium break-words text-[#9e9e9e]">
          {description}
        </span>
      )}
    </Card>
  );
}
