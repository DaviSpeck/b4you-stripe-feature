import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { GoArrowLeft } from "react-icons/go";
import { Button } from "@/components/ui/button";

export default function Page() {
  const router = useRouter();
  return (
    <>
      <Head>
        <link rel="icon" href="/fav-b4y.png" />
        <title>Oferta não encontrada</title>
      </Head>
      <main className="flex h-screen flex-col items-center justify-center">
        <Image src={"/error.gif"} width={180} height={180} alt="" />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-center text-[1rem] font-semibold text-[#424242] min-[600px]:text-[2rem]">
              Ops! Oferta não encontrada
            </h3>
            <p className="text-center text-[1.25rem] text-[#424242]">
              A oferta que você está procurando não está <br /> disponível no
              momento.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              className="cursor-pointer border-[2px] border-[#5BEBD4]"
              variant={"outline"}
              type="button"
              onClick={() => router.back()}
            >
              <GoArrowLeft />
              Voltar
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
