import {
  styleTextHello,
  styleText,
  styleBreakLineBigger,
  styleBreakLine,
  styleButtonCenter,
  styleButton,
} from './styles.mjs';

export const affiliateInvite = ({ producer_name, affiliate_name, product_name, url }) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá ${affiliate_name},</div>`,
    body: `  <div ${styleText}>E aí, tudo bem?</div>
               <div ${styleBreakLineBigger}></div>
               <div ${styleText}>Você foi convidado pelo produtor <b>${producer_name}</b> para ser afiliado em <b>${product_name}.</b></div>
               <div ${styleBreakLine}></div>
               <div ${styleText}>Clique no botão abaixo para visitar a página de afiliação do produtor</div>
               <div ${styleButtonCenter}><a ${styleButton} href="${url}">PÁGINA DE AFILIAÇÃO</a></div>           
               <div ${styleBreakLineBigger}></div>
               <div ${styleBreakLine}></div>
               <div ${styleText}>Abraços,</div>
               <div ${styleText}>Equipe B4you.</div>
          `,
  };
  return emailTemplate;
};

export const registerPage = (producer_name, url_dashboard) => {
  const emailTemplate = {
    header: `<div ${styleTextHello}>Olá,</div>`,
    body: `  <div ${styleText}>E aí, tudo bem?</div>
               <div ${styleBreakLineBigger}></div>
               <div ${styleText}>Você foi convidado para participar da nossa plataforma por <b>${producer_name}</b> e ser afiliado em um produto. Clique no botão abaixo para se cadastrar.</div>
               <div ${styleBreakLine}></div>
               <div ${styleButtonCenter}><a ${styleButton} href="${url_dashboard}/cadastrar">REGISTRE-SE</a></div>           
               <div ${styleBreakLineBigger}></div>
               <div ${styleBreakLine}></div>
               <div ${styleText}>Abraços,</div>
               <div ${styleText}>Equipe B4you.</div>
          `,
  };
  return emailTemplate;
};
