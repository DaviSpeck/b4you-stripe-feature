import Image from "next/image";
import Link from "next/link";
import { v4 as uuid } from "uuid";

export function FooterPage() {
  const cardFlagsUriArr: string[] = [
    "/card-flags/paymentmethodslightamericanexpress3203-2jw4.svg",
    "/card-flags/paymentmethodslightdinersclub3203-nqz8.svg",
    "/card-flags/paymentmethodslightdiscover3203-b54o.svg",
    "/card-flags/paymentmethodslightelo3203-zmb.svg",
    "/card-flags/paymentmethodslighthipercard3203-5i8.svg",
    "/card-flags/paymentmethodslightjcb3203-m7i.svg",
    "/card-flags/paymentmethodslightmaestro3203-r2a9.svg",
    "/card-flags/paymentmethodslightmastercard3203-sf1i.svg",
    "/card-flags/paymentmethodslightvisa3203-l31s.svg",
  ];

  return (
    <footer className="flex items-center justify-center self-end border-t p-8">
      <div className="flex w-fit flex-col gap-4">
        <h5 className="w-full text-center text-[1.2rem] font-medium text-[#450318]">
          Formas de pagamento
        </h5>
        <div className="flex w-full flex-wrap justify-center gap-2">
          {cardFlagsUriArr.map((uri) => (
            <Image key={uuid()} src={uri} width={32} height={25} alt="" />
          ))}
        </div>
        <div className="f flex w-full flex-col font-normal text-[#868686]">
          <p className="w-full text-center text-[0.75rem]">
            Esse site é protegido pelo reCAPTCHA do Google <br />
            {/*{" "}
            <Link
              href="https://blog.b4you.com.br/wp-content/uploads/2023/08/B4you-Poli%CC%81tica-de-Privacidade-do-Site.pdf"
              className="font-bold underline"
              target="_blank"
            >
              Política de Privacidade
            </Link>{" "}
            e */}
            <Link
              href="https://b4you.com.br/termos"
              rel="noreferrer"
              target="_blank"
              className="font-bold underline"
            >
              Termos de Uso
            </Link>
            <br />
            <br />
            *Parcelamento com acréscimo. Ao prosseguir você concorda com a{" "}
            <Link
              href="https://blog.b4you.com.br/wp-content/uploads/2025/06/B4you-Politica-de-Pagamento.pdf"
              rel="noreferrer"
              target="_blank"
              className="font-bold underline"
            >
              Política de Pagamento
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
