import mailjetService from 'node-mailjet';

const headers = {
  'Content-Type': 'application/json',
};

export const handler = async (event) => {
  console.log('event', event);

  let response = {
    statusCode: 500,
    body: JSON.stringify({
      message: 'Unexpected error',
    }),
    headers,
  };

  try {
    const apiKey = event.headers?.['x-api-key'] || event.headers?.['X-Api-Key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
      response.statusCode = 401;
      response.body = JSON.stringify({
        message: 'Unauthorized: Invalid API key',
      });
      return response;
    }

    if (event.requestContext?.http?.method !== 'POST') {
      response.statusCode = 405;
      response.body = JSON.stringify({
        message: 'Method not allowed',
      });
      return response;
    }

    let body;
    try {
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (error) {
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'Invalid JSON in request body',
      });
      return response;
    }

    const { email, subject, body: emailBody } = body;

    if (!email || !subject || !emailBody) {
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'Missing required fields: email, subject, body',
      });
      return response;
    }

    const { MAILJET_USERNAME, MAILJET_PASSWORD, MAILJET_EMAIL_SENDER, MAILJET_TEMPLATE_ID } = process.env;

    if (!MAILJET_USERNAME || !MAILJET_PASSWORD || !MAILJET_EMAIL_SENDER) {
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: 'Mailjet configuration missing',
      });
      return response;
    }

    const mailjet = mailjetService.apiConnect(MAILJET_PASSWORD, MAILJET_USERNAME);

    const messageConfig = {
      From: {
        Email: MAILJET_EMAIL_SENDER,
        Name: 'B4you',
      },
      To: [
        {
          Email: email.trim(),
        },
      ],
      Subject: subject,
    };

    if (MAILJET_TEMPLATE_ID) {
      messageConfig.TemplateID = +MAILJET_TEMPLATE_ID;
      messageConfig.TemplateLanguage = true;
      messageConfig.Variables = {
        body: emailBody,
      };
    } else {
      const textBody = emailBody.replace(/<[^>]*>/g, '');
      messageConfig.HTMLPart = emailBody;
      messageConfig.TextPart = textBody;
    }

    const emailResponse = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [messageConfig],
    });

    console.log('Email sent successfully:', emailResponse);

    response.statusCode = 200;
    response.body = JSON.stringify({
      message: 'Email sent successfully',
    });

    return response;
  } catch (error) {
    console.error('Error:', error);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Internal server error',
      error: error.message,
    });
    return response;
  }
};
