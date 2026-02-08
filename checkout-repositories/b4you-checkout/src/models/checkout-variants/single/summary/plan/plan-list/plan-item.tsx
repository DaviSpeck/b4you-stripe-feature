interface iProps {
  title: string;
  description: string | null;
  price: number;
  quantity: number | null;
}

export function PlanItem(props: iProps) {
  const { title, description, price, quantity } = props;

  return (
    <li className="flex cursor-pointer items-center justify-between border-b py-2.5">
      <div>
        <h4 className="text-[0.875rem]">{title}</h4>
        {Boolean(description) && (
          <span className="block text-[0.875rem] text-[#797979]">
            {description}
          </span>
        )}
      </div>
      <div className="flex flex-col justify-center">
        <span className="block text-end text-[0.875rem]">
          {(quantity ? quantity * price : price).toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
        {Boolean(quantity) && (
          <span className="block text-[0.813rem] text-[#797979]">
            Quantidade: {quantity}
          </span>
        )}
      </div>
    </li>
  );
}
