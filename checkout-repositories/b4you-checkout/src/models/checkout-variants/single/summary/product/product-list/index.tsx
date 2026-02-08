import { useEffect, useState } from "react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { OrderBumpItem } from "./order-bump-item";
import { ProductItem } from "./product-item";

export function ProductList() {
  const { offerData } = useOfferData();

  if (!offerData) return <></>;

  const offerTitle = Boolean(offerData.offer.alternative_name)
    ? offerData.offer.alternative_name
    : offerData.offer.name;

  const showDescription =
    offerData.customizations.show_custom_description === "true" &&
    Boolean(offerData.description);

  return (
    <ul>
      {Array.isArray(offerData.offerShopify) &&
        offerData.offerShopify.map((offer) => (
          <ProductItem
            key={offer.variant_id}
            title={offer.title}
            description={null}
            price={Number(offer.price)}
            quantity={offer.quantity}
          />
        ))}
      {!Array.isArray(offerData.offerShopify) && (
        <ProductItem
          title={offerTitle ?? offerData.product.name}
          description={showDescription ? offerData.description : null}
          price={offerData.original_price}
          quantity={0}
        />
      )}
      <ProductList.OrderBumps />
    </ul>
  );
}

ProductList.OrderBumps = function () {
  const [orders, setOrders] = useState<Record<string, number>>({});

  const { orderBumps } = useOfferPayment();

  useEffect(() => {
    if (!orderBumps) return;

    const orderBump: Record<string, number> = {};

    orderBumps.forEach(
      (obUuid) => (orderBump[obUuid] = (orderBump[obUuid] || 0) + 1),
    );

    setOrders(orderBump);
  }, [orderBumps]);

  if (orderBumps.length === 0) return <></>;

  return (
    <>
      {orderBumps &&
        Object.entries(orders).map(([uuid, amount]) => (
          <OrderBumpItem key={uuid} orderBumpUuid={uuid} amount={amount} />
        ))}
    </>
  );
};
