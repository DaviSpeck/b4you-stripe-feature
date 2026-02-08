import Image from "next/image";
import { useEffect } from "react";
import { fecthRead } from "@/utils/fetch";
import { useErrorStore } from "@/context/page-error-redirect";

export function ServerErrorPage() {
  const { isSuccess } = fecthRead({
    queryKey: ["health-check"],
    route: "/health-check",
    options: {
      refetchOnReconnect: true,
      refetchInterval: 15 * 60 * 1000,
    },
  });

  useEffect(() => {
    useErrorStore.setState({ isServerError: isSuccess });
  }, [isSuccess]);

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <Image src={"/no-data.gif"} width={180} height={180} alt="" />
      <div className="flex flex-col items-center justify-center gap-4">
        <div>
          <h3 className="text-[2rem] font-semibold text-[#424242]">
            Estamos fora do ar por um momento
          </h3>
          <p className="text-center text-[1.25rem] text-[#424242]">
            O serviço está temporariamente indisponível. <br /> Tente novamente
            mais tarde.
          </p>
        </div>
      </div>
    </main>
  );
}
