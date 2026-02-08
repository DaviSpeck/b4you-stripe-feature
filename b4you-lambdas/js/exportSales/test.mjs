import { handler } from './index.mjs';

handler({
  Records: [
    {
      body: JSON.stringify({
        query: {
          id_user: 9,
          page: 0,
          size: 10,
          id_status: [2],
          startDate: '2024-05-22',
          endDate: '2024-05-28',
          role: { producer: true, coproducer: true, affiliate: true, supplier: true },
          trackingParameters: {
            src: '',
            sck: '',
            utm_source: '',
            utm_medium: '',
            utm_campaign: '',
            utm_content: '',
            utm_term: '',
          },
        },
        first_name: 'João',
        format: 'xlsx',
        email: 'vinixp.vp@gmail.com',
      }),
    },
  ],
});
