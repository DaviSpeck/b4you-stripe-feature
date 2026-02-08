import * as ReactDOMServer from 'react-dom/server';
import resolveCDNURL from '../../../../../../providers/cdnUpsell';
import ButtonDS from '../../../../../../jsx/components/design-system/ButtonDS';
import { notify } from '../../../../../functions';
import { StyleView } from './style-view';

export const generateHTML = (params) => {
  // let html = ReactDOMServer.renderToString(renderPreview(true));
  let html = ReactDOMServer.renderToString(
    <StyleView
      isRemoveBorders={false}
      colorUpsell={params.colorUpsell}
      colorAcceptUpsell={params.colorAcceptUpsell}
      fontSizeUpsell={params.fontSizeUpsell}
      textAcceptUpsell={params.textAcceptUpsell}
      colorRefuseUpsell={params.colorRefuseUpsell}
      fontSizeUpsellRefused={params.fontSizeUpsellRefused}
      textRefuseUpsell={params.textRefuseUpsell}
    />
  );
  const style = document.createElement('link');
  const cdnURL = resolveCDNURL();
  style.rel = 'stylesheet';
  style.href = `${cdnURL}/css/style.min.css`;
  html = `${style.outerHTML}\n${html}`;
  html += `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap"
    rel="stylesheet"
  />`;
  html += `
  <div id="modal-upsell-container" class="modal-container">
    <div class="modal" id="modal-upsell">
      <div class="modal-header">
        <h3 class="subtitulo">Pagamento adicional</h3>
      </div>
      <div class="border"></div>
      <div class="modal-body">
        <iframe 
          id="frameModalBody" 
          src=""
          ></iframe>
      </div>
      <div class="modal-footer">
        <div class="protected-buy">
          <div class="frame">
            <img src="${cdnURL}/css/images/bxs-check-shield.svg"/>
          </div>
          <span>Protegemos suas informações de pagamento
            usando criptografia para fornecer segurança
          </span>
        </div>
      </div>
    </div>
  </div>`;
  const scriptSource = document.createElement('script');
  scriptSource.src = `${cdnURL}/js/script.js`;
  const scriptVariables = document.createElement('script');
  scriptVariables.innerHTML = `
    let upsellOffer = "${params.upsell ?? ''}";
    let upsellPlan = "${params.isUpsellSubscription ? params.plan : ''}";
    let acceptUpsellURL = "${
      params.actionAcceptUpsell === 'other_offer' ? params.urlAcceptUpsell : ''
    }";
    let refuseUpsellURL = "${
      params.actionRefuseUpsell === 'other_offer' ? params.urlRefuseUpsell : ''
    }";
    let deliveryURL = "${params.deliveryURL}";
    let oneClick = ${params.oneClickUpsel};
  `;
  html += `\n${scriptVariables.outerHTML}`;
  html += `\n${scriptSource.outerHTML}`;
  return html;
};

export const HtmlCopy = (props) => {
  const handleHTMLCopy = () => {
    const html = generateHTML(props);
    navigator.clipboard.writeText(html);
    notify({ message: 'HTML copiado!', type: 'success' });
  };

  return (
    <ButtonDS
      size={'sm'}
      variant='primary'
      onClick={handleHTMLCopy}
      iconLeft={'bx-copy-alt'}
    >
      <span>Copiar HTML</span>
    </ButtonDS>
  );
};
