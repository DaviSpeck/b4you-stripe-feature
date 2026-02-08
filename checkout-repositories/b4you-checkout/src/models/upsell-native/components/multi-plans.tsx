import { useEffect, memo } from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { Frequency, iOffer, iUpsellNative, normalizeFrequency } from "@/interfaces/offer";
import { useUpsellNativeStorage } from "../storage";

interface Props {
  plans?: iUpsellNative["plans"];
}

export const MultiPlans = ({ plans }: Props) => {
  const { set, planSelect } = useUpsellNativeStorage();

  useEffect(() => {
    if (!plans?.length) return;
    if (planSelect) return;

    set({
      planSelect: {
        uuid: plans[0].uuid,
        offer_uuid: plans[0].offer_uuid,
      },
    });
  }, [plans, planSelect, set]);

  if (!plans?.length) return null;

  return (
    <div className="flex flex-col gap-2.5 pb-4">
      {plans.map((item) => (
        <PlanItem key={item.uuid} {...item} />
      ))}
    </div>
  );
};

type PlanItemProps = iUpsellNative["plans"][number];

const frequencyDictionary: Record<Frequency, string> = {
  mensal: "mensalmente",
  bimestral: "bimestralmente",
  trimestral: "trimestralmente",
  semestral: "semestralmente",
  anual: "anualmente",
};

const formatCurrency = (value?: number | null) =>
  (value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const PlanItem = memo((props: PlanItemProps) => {
  const {
    uuid,
    label,
    frequency_label,
    price,
    subscription_fee,
    subscription_fee_price,
  } = props;

  const { set, planSelect } = useUpsellNativeStorage();
  const isSelected = planSelect?.uuid === uuid;

  return (
    <div
      className="relative flex cursor-pointer flex-row gap-2 rounded-[8px] border border-[#d9d9d9] bg-white p-3 transition-colors hover:border-[#0f1b35]"
      onClick={() =>
        set({
          planSelect: {
            uuid,
            offer_uuid: props.offer_uuid,
          },
        })
      }
      style={isSelected ? { borderColor: "#0f1b35" } : undefined}
    >
      {isSelected && (
        <IoIosCheckmarkCircleOutline
          className="absolute top-2 right-3 text-green-600"
          size={20}
        />
      )}

      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col items-start">
          <h1 className="w-full text-[0.85rem] font-medium min-[750px]:text-[1rem]">
            {label ?? "Plano"}
          </h1>

          <p className="text-[0.75rem] font-normal min-[750px]:text-[0.875rem]">
            Cobrado{" "}
            {frequencyDictionary[normalizeFrequency(frequency_label)] ?? frequency_label ?? ""}
          </p>

          {subscription_fee && (
            <p className="text-[0.65rem] font-semibold min-[750px]:text-[0.775rem]">
              <span className="pr-1 font-medium">Taxa de Adesão:</span>
              {formatCurrency(subscription_fee_price)}
            </p>
          )}
        </div>

        <div className="flex h-full items-end text-[0.775rem] min-[750px]:text-[0.875rem]">
          {formatCurrency(price)}
        </div>
      </div>
    </div>
  );
});

PlanItem.displayName = "PlanItem";