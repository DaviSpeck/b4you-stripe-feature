import Head from "next/head";
import { ServerErrorPage } from "@/models/server-error";

export default function Page() {
  return (
    <>
      <Head>
        <link rel="icon" href="/fav-b4y.png" />
        <title>Oferta não disponível no momento</title>
      </Head>
      <ServerErrorPage />;
    </>
  );
}
