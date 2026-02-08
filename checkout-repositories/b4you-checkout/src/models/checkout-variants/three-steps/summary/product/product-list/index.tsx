import { useEffect, useState } from "react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";
import { OrderBumpsItem } from "./order-bump-item";
import { ProductItem } from "./product-item";

export function ProductList() {
  const [orders, setOrders] = useState<Record<string, number>>({});

  const { offerData, getOfferPrice } = useOfferData();
  const { paymentSelected, orderBumps } = useOfferPayment();

  useEffect(() => {
    if (!orderBumps) return;

    const orderBump: Record<string, number> = {};

    orderBumps.forEach(
      (obUuid) => (orderBump[obUuid] = (orderBump[obUuid] || 0) + 1),
    );

    setOrders(orderBump);
  }, [orderBumps]);

  if (!offerData) return <></>;

  const offerTitle = Boolean(offerData.offer.alternative_name)
    ? offerData.offer.alternative_name
    : offerData.offer.name;

  const offerImage = Boolean(offerData.customizations.alternative_image)
    ? offerData.customizations.alternative_image
    : offerData.product.cover;

  const showDescription =
    offerData.customizations.show_custom_description === "true" &&
    Boolean(offerData.description);

  const { price, discount } = getOfferPrice(paymentSelected ?? "CARD");

  return (
    <ul className={cn("flex flex-col gap-2")}>
      {!Array.isArray(offerData.offerShopify) && (
        <ProductItem
          title={offerTitle}
          description={showDescription ? offerData.description : null}
          price={offerData.original_price}
          discount={discount}
          image={offerImage}
          priceWithDiscount={price}
          quantity={offerData.quantity}
          type="physical"
        />
      )}
      {Array.isArray(offerData.offerShopify) &&
        offerData.offerShopify.length > 0 &&
        offerData.offerShopify.map((offer) => (
          <ProductItem
            key={offer.variant_id}
            title={offer.title}
            description={null}
            price={Number(offer.price)}
            discount={0}
            image={offer.image}
            priceWithDiscount={null}
            quantity={offer.quantity}
            type="physical"
          />
        ))}
      {orderBumps &&
        Object.entries(orders).map(([uuid, amount]) => (
          <OrderBumpsItem key={uuid} orderBumpUuid={uuid} amount={amount} />
        ))}
    </ul>
  );
}
