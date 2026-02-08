import Cards, { Focused } from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { z } from "zod";
import { FormCreditCardValidation } from "./_schema";

type CardInfoType = z.infer<typeof FormCreditCardValidation>;

interface iProps {
  cardData: CardInfoType;
  focusField: keyof CardInfoType;
}

export function CardPreview(props: iProps) {
  const { focusField, cardData } = props;

  const dicionary: Record<keyof CardInfoType, Focused> = {
    cardNumber: "number",
    cardValidate: "expiry",
    secreteCardNumber: "cvc",
    cardHolderName: "name",
  };

  return (
    <Cards
      number={String(cardData.cardNumber ?? "")}
      expiry={String(cardData.cardValidate ?? "")}
      cvc={String(cardData.secreteCardNumber ?? "")}
      name={String(cardData.cardHolderName ?? "")}
      focused={dicionary[focusField]}
      placeholders={{
        name: "Nome do titular",
      }}
      locale={{
        valid: "Validade",
      }}
    />
  );
}
