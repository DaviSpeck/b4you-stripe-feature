const styleText = `style=
"font-family: Arial, sans-serif;
font-size: 16px;
letter-spacing: normal;
line-height: 26px;
color: #333 !important;
text-align: justify;"`;

const styleTextHello = `style=
  "font-family: Arial, sans-serif;
  font-size: 22px;
  letter-spacing: normal;
  color: rgb(15,27,53) !important;
  line-height: 1;
  margin: 30px 0;
  font-weight: bold;
  text-align: left;"`;

const styleButton = `style=
  "display: inline-block;
  background: #0F1B35;
  color: #FFFFFF;
  font-family: Arial,sans-serif;
  font-size: 14px;
  font-weight: bold;
  line-height: 120%;
  margin: 0;
  text-decoration: none;
  text-transform: none;
  padding: 8px 22px;
  border-radius: 3px;"`;

const styleButtonCenter = `style="
text-align: center;
padding: 30px;"`;

const styleBreakLineBigger = `style="margin-bottom: 30px"`;

export const confirmedPaymentSale = ({
  full_name,
  product_name,
  commission,
  src,
  created_at,
  uuid,
}) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${full_name},</div>`,
    body: `<div ${styleBreakLineBigger}></div><div ${styleText}>Um cliente acabou de pagar pelo produto <b>${product_name}</b>.</div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Transação: ${uuid}</div>
             <div ${styleText}>Data do Pedido: ${created_at}</div>
             ${src ? `<div ${styleText}>Origem SRC: ${src}</div>` : ''}
             <div ${styleText}>Comissão: ${commission}</div>
             <div ${styleButtonCenter}><a ${styleButton} href=${
      process.env.URL_SIXBASE_DASHBOARD
    }>ABRIR DETALHES></a></div>
             <div ${styleBreakLineBigger}></div>
             <div ${styleText}>Abraços,</div>
             <div ${styleText}>Equipe B4you.</div>
        `,
  };
  return emailTemplate;
};
