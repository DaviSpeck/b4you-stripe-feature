import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from "next/document";

interface ExtendedDocumentProps extends DocumentInitialProps {
  nonce?: string;
}

class MyDocument extends Document<ExtendedDocumentProps> {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<ExtendedDocumentProps> {
    const initialProps = await Document.getInitialProps(ctx);
    const nonce = ctx.res?.getHeader("x-nonce") as string | undefined;

    return {
      ...initialProps,
      nonce,
    };
  }

  render() {
    const { nonce } = this.props;

    return (
      <Html lang="pt-BR" translate="no">
        <Head nonce={nonce}>
          <meta charSet="utf-8" />
          <meta name="google" content="notranslate" />

          {/* Google Fonts - Poppins */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </Html>
    );
  }
}

export default MyDocument;