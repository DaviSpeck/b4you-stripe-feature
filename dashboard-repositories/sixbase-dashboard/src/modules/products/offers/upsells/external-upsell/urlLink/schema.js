import * as yup from 'yup';
import regexUrl from '../../../../../../utils/regex-url';

export const urlLinkSchema = yup.object({
  thankyou_page_upsell: yup
    .string()
    .required('Campo obrigatório')
    .test('is-url', 'URL inválida', (value) => regexUrl(value)),
});
