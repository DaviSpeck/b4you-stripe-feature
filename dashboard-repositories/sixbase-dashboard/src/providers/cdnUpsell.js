let host = window.location.host;

function resolveCDNURL() {
  let endpoint = '';
  if (host.includes('sandbox')) {
    endpoint = 'https://cdn.b4you.com.br/upsell-script/sandbox';
  } else if (host.includes('dash.b4you.com.br')) {
    endpoint = 'https://cdn.b4you.com.br/upsell-script/production';
  } else {
    endpoint = 'https://cdn.b4you.com.br/upsell-script/sandbox';
  }

  return endpoint;
}

export default resolveCDNURL;
