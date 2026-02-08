import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { ProductItem } from "./product-item";

interface iProps {
  orderBumpUuid: string;
  amount: number;
}

export function OrderBumpItem(props: iProps) {
  const { orderBumpUuid, amount } = props;

  const { offerData } = useOfferData();
  const { paymentSelected } = useOfferPayment();

  if (!paymentSelected || !offerData) return <></>;

  const orderBump = offerData.order_bumps.find(
    (ob) => ob.uuid === orderBumpUuid,
  );

  if (!orderBump) return <></>;

  const orderBumpName = orderBump.product.name;

  const price = orderBump.price;

  return (
    <ProductItem
      title={orderBumpName}
      description={"Oferta especial"}
      price={price}
      quantity={amount}
    />
  );
}
