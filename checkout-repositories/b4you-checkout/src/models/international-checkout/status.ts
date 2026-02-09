export const paymentStatuses = [
  "pending",
  "approved",
  "failed",
  "refunded",
  "dispute",
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];

export const isFinalStatus = (status: PaymentStatus) =>
  status === "approved" || status === "failed";

export const statusConfig: Record<
  PaymentStatus,
  { title: string; description: string }
> = {
  pending: {
    title: "Payment pending",
    description:
      "We are waiting for confirmation. You can retry later without creating a new charge.",
  },
  approved: {
    title: "Payment approved",
    description: "Your payment was confirmed successfully.",
  },
  failed: {
    title: "Payment failed",
    description:
      "We could not confirm the payment. You can try again using the same transaction.",
  },
  refunded: {
    title: "Payment refunded",
    description: "This status is informational and does not confirm a new payment.",
  },
  dispute: {
    title: "Payment disputed",
    description: "This status is informational and does not confirm a new payment.",
  },
};
