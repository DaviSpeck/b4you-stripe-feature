import Image from "next/image";

export default function Page() {
  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <Image
        className="w-[110px] min-[600px]:w-[180px]"
        src={"/error.gif"}
        unoptimized
        width={180}
        height={180}
        alt=""
      />
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col gap-2 px-1.5">
          <h3 className="text-center text-[1rem] font-semibold text-[#424242] min-[600px]:text-[2rem]">
            Ops! Oferta não encontrada
          </h3>
          <p className="text-center text-[0.875rem] text-[#424242] min-[600px]:text-[1.25rem]">
            A oferta que você está procurando não está <br /> disponível no
            momento.
          </p>
        </div>
      </div>
    </main>
  );
}
