import Cookies from "js-cookie";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { IoCheckmark } from "react-icons/io5";
import { LiaCheckCircle } from "react-icons/lia";
import { iSaleData } from "@/interfaces/sale-data";
import { cn } from "@/shared/libs/cn";

interface iPageThanks {
  saleData: iSaleData;
}

export function PageThanks({ saleData }: iPageThanks) {
  const { products = [], student } = saleData;

  useEffect(() => {
    Cookies.remove("initiate-checkout");
  }, []);

  const primaryTitle = useMemo(() => {
    return products[0]?.name ?? "sua compra";
  }, [products]);

  const studentEmail = student?.email ?? "";

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4 bg-[#f6f6f6] max-[560px]:bg-[#fff] max-[560px]:pb-[30px]">
      <div className="flex max-w-[500px] flex-col justify-center gap-4 bg-[#fff] p-[60px] pb-[40px] shadow-lg max-[560px]:h-full max-[560px]:w-full max-[560px]:p-4 max-[560px]:shadow-none">
        <div className="flex flex-col items-center justify-center gap-7">
          <div className="flex flex-col items-center justify-center gap-5">
            <LiaCheckCircle size={80} />
            <h1 className="text-[1.5rem] font-medium text-[#0f1b35]">
              Compra aprovada!
            </h1>
          </div>

          <p className="text-center text-[1rem] font-normal">
            A sua compra de{" "}
            <span className="font-bold">{primaryTitle}</span> foi realizada com
            sucesso.
          </p>
        </div>

        {products.length > 1 && (
          <ul className="flex flex-col gap-[1.5px]">
            {products.map((product, i) => (
              <PageThanks.Product
                key={product.uuid}
                data={product}
                index={i}
                lastIndex={products.length - 1}
              />
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-2.5">
            <p className="text-center text-[0.775rem] text-[#6c757d]">
              Enviamos um e-mail para{" "}
              <span className="font-bold">{studentEmail}</span> com o resumo da
              sua transação.
            </p>
            <p className="text-center text-[0.775rem] text-[#6c757d]">
              Caso não encontre, verifique o spam ou lixo eletrônico.
            </p>
          </div>

          <span className="block w-full text-center text-[0.775rem] font-medium text-[#21252969]">
            Transação: {saleData.uuid}
          </span>
        </div>
      </div>

      <Image
        className="mt-[15px] mb-[15px] opacity-60 grayscale"
        src="/logo-horizontal.png"
        alt="B4You"
        width={150}
        height={40}
      />
    </main>
  );
}

interface iProductProps {
  index: number;
  lastIndex: number;
  data: iSaleData["products"][0];
}

PageThanks.Product = function (props: iProductProps) {
  const { data, index, lastIndex } = props;

  const title = data.name ?? data.offer?.name;
  const subtitle = data.is_upsell
    ? "Oferta adicional"
    : data.plan?.label ?? null;

  return (
    <li
      className={cn(
        "flex items-start gap-2 bg-gray-100 p-2 px-3 text-[0.85rem]",
        index === 0 && "rounded-t-[8px]",
        lastIndex === index && "rounded-b-[8px]",
      )}
    >
      <IoCheckmark className="mt-[2px] text-green-500" size={18} />

      <div className="flex flex-col leading-tight">
        <h1 className="font-normal">{title}</h1>

        {subtitle && (
          <span className="text-[0.7rem] text-gray-500">
            {subtitle}
          </span>
        )}
      </div>
    </li>
  );
};