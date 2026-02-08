const {
  styleBreakLineBigger,
  styleButton,
  styleButtonCenter,
  styleText,
  styleTextHello,
} = require('../styles');
const { slugify } = require('../../utils/formatters');

const approvedProduct = ({ product_name, producer_name, uuid_product }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Oi, ${producer_name}! Tudo bem?</div>`,
    body: ` 
    <div ${styleText}>Temos uma ótima notícia pra você!</div>
    <div ${styleBreakLineBigger}></div>
    <div ${styleText}><b>*O seu produto ${product_name} foi aprovado na nossa Vitrine* 🎉</b></div>
    <div ${styleText}>Você pode clicar no botão abaixo para revisar as informações do seu produto</div>
          <div ${styleButtonCenter}><a ${styleButton} href="${
      process.env.URL_SIXBASE_DASHBOARD
    }/mercado/produto/${slugify(
      product_name,
    )}/${uuid_product}">MEU PRODUTO</a></div>
          <div ${styleText}>Aqui vão algumas dicas:</div>  
          <div ${styleText}>- Mantenha o material de divulgação sempre atualizado</div>   
          <div ${styleText}>- Ofereça suporte para os seus futuros parceiros</div>   
          <div ${styleText}>- Lembre-se de que, mesmo após a aprovação do seu produto é necessário que a opção <b>“Listar no mercado”</b> esteja <b>habilitada como “Sim”</b>. Você pode fazer isso na seção "Mercado", dentro das configurações do seu produto na aba "Afiliados".</div> 
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Estamos ansiosos para ver as suas vendas aumentando!</div>
          <div ${styleText}>Em caso de dúvida, entre em contato com o nosso suporte.</div>
          <div ${styleBreakLineBigger}></div> 
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

const reprovedProduct = ({ product_name, producer_name, reason }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${producer_name}, Tudo bem?</div>`,
    body: `<div  ${styleText}>Após uma análise cuidadosa, definimos que o seu produto ${product_name} não foi aprovado para a nossa vitrine.</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Motivo da recusa:</div>
          <div ${styleText}>${reason}</div>
          <div ${styleBreakLineBigger}></div>
          <div ${styleText}>Mas não se preocupe, você pode entrar em contato conosco apertando no botão abaixo para que possamos te ajudar a regularizar o seu produto:</div> 
          <div ${styleBreakLineBigger}></div>
          <div ${styleButtonCenter}><a ${styleButton} href="https://api.whatsapp.com/send?phone=5561996190075&text=Quero+regularizar+meu+produto">ENTRAR EM CONTATO</a></div>
          <div ${styleText}>Abraços,</div>
          <div ${styleText}>Equipe B4you.</div>
      `,
  };
  return emailTemplate;
};

module.exports = {
  approvedProduct,
  reprovedProduct,
};
