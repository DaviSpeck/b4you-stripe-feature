import { useRouter } from "next/router";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";

interface iProps {
  fontSize: string;
  color: string;
  text: string;
}

export const BtnUpsellRefuse = (props: iProps) => {
  const [searchParams] = useQueryStates({
    sale_item_id: parseAsString.withDefault(""),
  });

  const { text, fontSize, color } = props;

  const router = useRouter();

  return (
    <Button
      className="cursor-pointer text-[0.85rem] underline"
      variant={"link"}
      style={{
        fontSize,
        color,
      }}
      onClick={() =>
        router.replace(`/payment-thanks/${searchParams.sale_item_id}`)
      }
    >
      {text}
    </Button>
  );
};
