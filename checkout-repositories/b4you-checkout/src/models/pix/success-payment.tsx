import Image from "next/image";

export function SuccessPayment() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center">
      <Image src={"/shopping-bag.gif"} width={160} height={160} alt="" />
      <h1 className="text-[1.5rem] font-normal">
        Pagamento realizado com sucesso!
      </h1>
    </div>
  );
}
