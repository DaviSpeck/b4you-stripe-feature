export const affiliateStatus = [
  {
    id: 1,
    name: "Pendente",
    color: "light",
    label: "Pendente",
    key: "pending",
  },
  {
    id: 2,
    name: "Ativo",
    color: "success",
    label: "Afiliado",
    key: "active",
  },
  {
    id: 3,
    name: "Bloqueado",
    color: "danger",
    label: "Bloqueado",
    key: "blocked",
  },
  {
    id: 4,
    name: "Recusado",
    color: "danger",
    label: "Recusado",
    key: "refused",
  },
  {
    id: 5,
    name: "Cancelado",
    color: "danger",
    label: "Cancelado",
    key: "canceled",
  },
];

export const findAffiliateStatus = (type) => {
  if (!type) throw new Error("type must be provided");
  if (typeof type !== "string" && typeof type !== "number")
    throw new Error("type must be string or number");
  const parameter = typeof type === "string" ? "name" : "id";
  const selectedType = affiliateStatus.find((s) => s[parameter] === type);
  return selectedType;
};

export const findAffiliateStatusByKey = (type) => {
  if (!type) throw new Error("type must be provided");
  if (typeof type !== "string" && typeof type !== "number")
    throw new Error("type must be string or number");
  const parameter = typeof type === "string" ? "key" : "id";
  const selectedType = affiliateStatus.find((s) => s[parameter] === type);
  return selectedType;
};
