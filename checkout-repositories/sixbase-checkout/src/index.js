import ReactDOM from 'react-dom';
import App from './App';
import DualKondutoProvider from './hooks/DualKondutoProvider';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
const urlParams = new URLSearchParams(window.location.search);

const utmParams = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];

utmParams.forEach((param) => {
  const value = urlParams.get(param);
  if (value) {
    sessionStorage.setItem(param, value);
  }
});

ReactDOM.render(
  <GoogleReCaptchaProvider reCaptchaKey='6LfwW2YjAAAAAMrxTpFz-taZm6UPatWccWyDevGY'>
    <DualKondutoProvider primaryKey='PCFCF226F32' secondaryKey='P5B36A902EC'>
      <App />
    </DualKondutoProvider>
  </GoogleReCaptchaProvider>,
  document.getElementById('root')
);
