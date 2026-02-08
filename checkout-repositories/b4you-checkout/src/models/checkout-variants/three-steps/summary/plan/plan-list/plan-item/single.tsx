import Image from "next/image";
import { Frequency, iOffer, normalizeFrequency } from "@/interfaces/offer";
import { cn } from "@/shared/libs/cn";

interface iSinglePlan {
  plan: iOffer["payment"]["plans"][0];
  image: string | null;
}

export const SinglePlan = (props: iSinglePlan) => {
  const { plan, image } = props;

  const frequencyDictionary: Record<Frequency, string> = {
    mensal: "mensalmente",
    bimestral: "bimestralmente",
    trimestral: "trimestralmente",
    semestral: "semestralmente",
    anual: "anualmente",
  };

  return (
    <li className="flex items-center gap-4 rounded-[6px] border-[1px] border-[#1a1a1a1a] bg-white p-4">
      {Boolean(image) && (
        <Image
          src={image ?? ""}
          width={60}
          height={60}
          quality={100}
          className="rounded-[8px] border"
          alt=""
        />
      )}
      <div className="w-full">
        <div className="flex justify-between">
          <h2 className="text-[0.85rem] font-medium">{plan.label}</h2>
          <span
            className={cn(
              "block text-[0.85rem] font-medium",
              !plan.charge_first &&
              plan.subscription_fee_price > 0 &&
              "line-through",
            )}
          >
            {plan.price.toLocaleString("pt-br", {
              currency: "BRL",
              style: "currency",
            })}
          </span>
        </div>
        <p className="text-[0.75rem] font-normal">
          Cobrado {frequencyDictionary[normalizeFrequency(plan.frequency)]}
        </p>
        {plan.subscription_fee && (
          <p className="text-[0.65rem] font-semibold">
            <span className="pr-1 font-medium">Taxa de Adesão:</span>
            {plan.subscription_fee_price.toLocaleString("pt-br", {
              currency: "BRL",
              style: "currency",
            })}
          </p>
        )}
      </div>
    </li>
  );
};
