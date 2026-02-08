/* eslint-disable */
import api from './api';

const triggerPixelIframe = (event, sale, ref) => {
  const notificationObj = {
    event_type: 'track',
    event,
  };

  if (event === 'Purchase' || event === 'BoletoGerado') {
    notificationObj['content_data'] = sale;
    window.fbq('track', 'Purchase', sale);
  }

  try {
    console.log(JSON.stringify(notificationObj));
    ref.current.contentWindow.postMessage(JSON.stringify(notificationObj), '*');
  } catch (error) {
    console.log(`[error] [triggerPixelIframe] -> `, error);
  }
};

export const triggerPixel = (event, sale, ref = null) => {
  if (event === 'initiate-checkout') {
    console.log('firedinitiate-checkout');

    if (ref) {
      triggerPixelIframe('InitiateCheckout', sale, ref);
    } else {
      // window.fbq('track', 'InitiateCheckout');
    }

    window.ttq.track('InitiateCheckout');
  }
  if (event === 'add-payment-info') {
    console.log('fired add-payment-info');

    console.log(ref);
    if (ref) {
      triggerPixelIframe('AddPaymentInfo', sale, ref);
    } else {
      // window.fbq('track', 'AddPaymentInfo');
    }
    window.ttq.track('AddPaymentInfo');
  }
  if (event === 'boleto') {
    console.log('boleto fired');
    if (ref) {
      triggerPixelIframe('BoletoGerado', sale, ref);
    }
  }
  if (event === 'purchase') {
    console.log('fired purchase');

    let params = {
      value: sale.value,
      currency: 'BRL',
    };
    let facebookParams = params;
    facebookParams.transaction_id = sale.contents[0].uuid;
    // facebookParams.payment_type = sale.payment_method;

    let tiktokParams = facebookParams;
    tiktokParams.content_id = sale.contents[0].uuid;

    // if (ref) {
    //   triggerPixelIframe('Purchase', sale, ref);
    // } else {
    window.fbq('track', 'Purchase', facebookParams);
    // }
    window.ttq.track('CompletePayment', tiktokParams);
  }
};

export const dispatchPixelEvent = (
  event,
  event_name,
  custom_data,
  fb_pixels
) => {
  // verify fb pixels
  if (fb_pixels && fb_pixels.length > 0) {
    fb_pixels.forEach((p) => {
      console.log(p);
      triggerPixel(event, custom_data, p.ref);
      if (p.api_token) {
        const data = {
          pixel_uuid: p.pixel_uuid,
          event_name,
          custom_data,
          event_id: event_name.toLowerCase() + '_' + p.event_id,
          test_event_code: p.test_event_code,
        };
        api
          .post('/cart/pixel', data)
          .then((response) => {
            console.log(response.data);
          })
          .catch((err) => console.log(err));
      }
    });
  } else {
    triggerPixel(event);
  }
};

export const triggerPixelPurchaseBoleto = (pixels, sale) => {
  let params = {
    value: sale.amount,
    currency: 'BRL',
  };

  if (pixels.facebook.length > 0) {
    if (pixels.facebook[0].settings.trigger_purchase_boleto) {
      let facebookParams = params;
      facebookParams.transaction_id = sale.sale_id;
      facebookParams.payment_type = 'billet';
      window.fbq('track', 'Purchase', facebookParams);
    }
  }

  if (pixels.tiktok.length > 0) {
    if (pixels.tiktok[0].settings.trigger_purchase_boleto) {
      let tiktokParams = params;
      tiktokParams.transaction_id = sale.sale_id;
      tiktokParams.payment_type = 'billet';
      window.ttq.track('CompletePayment', tiktokParams);
    }
  }
};

export const currency = (amount, currencyOption = 'brl') => {
  let locale = '';
  if (currencyOption === 'brl') {
    locale = 'pt-BR';
  }
  if (currencyOption === 'usd') {
    locale = 'en-US';
  }

  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyOption,
  }).format(amount);
};

export const time = () => {
  return Math.round(Date.now() / 1000);
};

export const validatePhone = (value) => {
  if (!value) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10;
};

export const validateEmail = (email) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

export const validateName = (name) => {
  const regexName = /^[a-zA-ZÀ-ÿ\s]+$/;
  let explode = name.split(' ');
  if (explode[1]) {
    return regexName.test(name)
      ? true
      : 'Não pode conter caracteres especiais ou números';
  } else {
    return 'Insira um nome válido';
  }
};

export const cleanDocument = (document) => {
  return document.replaceAll(/[^\d]/g, '');
};

export const hasQueryParams = (url) => {
  return url.indexOf('?') !== -1;
};

export const colorShade = (col, amt) => {
  col = col.replace(/^#/, '');
  if (col.length === 3)
    col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];

  let [r, g, b] = col.match(/.{2}/g);
  [r, g, b] = [
    parseInt(r, 16) + amt,
    parseInt(g, 16) + amt,
    parseInt(b, 16) + amt,
  ];

  r = Math.max(Math.min(255, r), 0).toString(16);
  g = Math.max(Math.min(255, g), 0).toString(16);
  b = Math.max(Math.min(255, b), 0).toString(16);

  const rr = (r.length < 2 ? '0' : '') + r;
  const gg = (g.length < 2 ? '0' : '') + g;
  const bb = (b.length < 2 ? '0' : '') + b;

  return `#${rr}${gg}${bb}`;
};

export const pixelNative = (event, data) => {
  try {
    window.fbq('track', event, data);
  } catch (error) {
    console.log('error on pixelNative', error);
  }
};

export const pixelNativeSingle = (pixel_id, event, data) => {
  try {
    window.fbq('trackSingle', pixel_id, event, data);
  } catch (error) {
    console.log('error on pixelNativeSingle', error);
  }
};

export const pixelNativeSingleCustom = (pixel_id, event, data) => {
  try {
    window.fbq('trackSingleCustom', pixel_id, event, data);
  } catch (error) {
    console.log('error on pixelNativeSingleCustom', error);
  }
};

export const pixelTikTok = (event, data) => {
  try {
    window.ttq.track(event, data);
  } catch (error) {
    console.log('error on pixelTikTok', error);
  }
};

export const googleAnalyticsSend = (event, data, gtmID) => {
  try {
    gtag('event', event, data);
  } catch (error) {
    console.log('error on googleAnalyticsSend', error);
  }
};

export const injectGoogleTagManager = (gtmID) => {
  try {
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gtmID}`;

    script.async = true;
    head.appendChild(script);

    const script2 = document.createElement('script');
    script2.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gtmID}');
    `;

    head.appendChild(script2);
  } catch (error) {
    console.log('error on injectGoogleTagManager', error);
  }
};

export const injectPinterest = (pixelIds) => {
  try {
    if (!pixelIds.length) return;
    const head = document.head;

    const pinterestScript = document.createElement('script');
    pinterestScript.async = true;
    pinterestScript.src = 'https://s.pinimg.com/ct/core.js';
    head.appendChild(pinterestScript);

    const pixelLoadCalls = pixelIds
      .map((pixelId) => `pintrk('load', '${pixelId}');`)
      .join('\n');

    const initScript = document.createElement('script');
    initScript.text = `
      !function(e){
        if(!window.pintrk){
          window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))
          };
          var n=window.pintrk;
          n.queue=[];
          n.version="3.0";
          var t=document.createElement("script");
          t.async=!0;
          t.src=e;
          var r=document.getElementsByTagName("script")[0];
          r.parentNode.insertBefore(t,r);
        }
      }("https://s.pinimg.com/ct/core.js");
      ${pixelLoadCalls}
      pintrk('page');
    `;
    head.appendChild(initScript);

    // 3. Cria fallback <img> para cada pixel (sem email)
    pixelIds.forEach((pixelId) => {
      const img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.style.display = 'none';
      img.alt = '';
      img.src = `https://ct.pinterest.com/v3/?event=init&tid=${pixelId}&noscript=1`;
      document.body.appendChild(img);
    });
  } catch (error) {
    console.error('Error injecting Pinterest pixel:', error);
  }
};

export const injectClearSaleNoScript = (sessionID, appKey) => {
  try {
    const body = document.getElementsByTagName('body')[0];
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.src = `https://device.clearsale.com.br/p/fp.png?sid=${sessionID}&app=${appKey}&ns=1`;
    noscript.appendChild(img);
    body.appendChild(noscript);

    const head = document.getElementsByTagName('head')[0];
    const scriptCheckUrl = document.createElement('script');
    scriptCheckUrl.text = `
    function checkUrl(url){
        let request = new XMLHttpRequest();
        request.open( "GET", url, true );
        request.send(null);
        request.onerror = (event) => {
            request.open("GET", "https://web.fpcs-monitor.com.br/p/fp.png?sid=${sessionID}&app=${appKey}&bl=1", false);
            request.send(null);
        }
    }
    checkUrl("https://device.clearsale.com.br/p/fp.png");
`;
    const scriptClearSale = document.createElement('script');
    scriptClearSale.text = `(function (a, b, c, d, e, f, g) {
    a['CsdpObject'] = e; a[e] = a[e] || function () {
    (a[e].q = a[e].q || []).push(arguments)
    }, a[e].l = 1 * Date.now(); f = b.createElement(c),
    g = b.getElementsByTagName(c)[0]; f.async = 1; f.src = d; g.parentNode.insertBefore(f, g)
    })(window, document, 'script', '//device.clearsale.com.br/p/fp.js', 'csdp');
    csdp('app', '${appKey}');
    csdp('sessionid', '${sessionID}');`;
    head.appendChild(scriptCheckUrl);
    head.appendChild(scriptClearSale);
  } catch (error) {
    console.log('error on inject noscript -> ', error);
  }
};

export const googleAdsSend = (data) => {
  try {
    gtag('event', 'conversion', data);
  } catch (error) {
    console.log('error on googleAdsSend', error);
  }
};

export const eventKwaiPixel = (data) => {
  try {
    const { pixel_id, event, body } = data;
    if (event === 'start' && pixel_id) {
      kwaiq.load(pixel_id);
      kwaiq.page();
    }
    if (event === 'initiateCheckout') {
      kwaiq.instance(pixel_id).track('addToCart');
    }
    if (event === 'purchase') {
      const {
        value,
        currency = 'BRL',
        content_type = 'product',
        content_id,
        num_items = 1,
        name = '',
      } = body;
      kwaiq.instance(pixel_id).track('purchase', {
        contents: [
          {
            content_id,
            content_type,
            content_name: name,
            quantity: num_items,
            price: value,
          },
        ],
        value,
        currency,
      });
    }
    if (event === 'add_payment_info') {
      const { value, name } = body;
      kwaiq.instance(pixel_id).track('contact', {
        content_type: 'product',
        content_name: name,
        quantity: 1,
        price: value,
        value,
        currency: 'BRL',
      });
    }
  } catch (error) {
    console.log('error on eventKwaiPixel', error);
  }
};

export const pushGTMEvent = (event, data = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...data,
  });
};
