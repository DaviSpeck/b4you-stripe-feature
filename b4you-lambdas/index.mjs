import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';

import { handler as affiliateInvite } from './affiliateInvite/index.mjs';
import { handler as approvedPaymentNotifications } from './approvedPaymentNotifications/index.mjs';
import { handler as blingShipping } from './blingShipping/index.mjs';
import { handler as collaboratorsActivity } from './collaboratorsActivity/index.mjs';
import { handler as confirmSplits } from './confirmSplits/index.mjs';
import { handler as exportSales } from './exportSales/index.mjs';
import { handler as generatedNotifications } from './generatedNotifications/index.mjs';
import { handler as integrations } from './integrations/index.mjs';
import { handler as requestWithdrawal } from './requestWithdrawal/index.mjs';
import { handler as sendNotifications } from './sendNotifications/index.mjs';
import { handler as splitCommissions } from './splitCommissions/index.mjs';
import { handler as studentApprovedPaymentEmails } from './studentApprovedPaymentEmails/index.mjs';
import { handler as webhookEvent } from './webhookEvent/index.mjs';
import { handler as exportSalesShipping } from './exportSalesShipping/index.mjs';
import { handler as importSalesShipping } from './importSalesShipping/index.mjs';

morgan.token('data', (req, res) => {
  let body = 'body: {}';
  let query = 'query: {}';
  let params = 'params: {}';
  if (req.body && Object.keys(req.body).length > 0) body = `body: ${JSON.stringify(req.body)}`;
  if (req.query && Object.keys(req.query).length > 0) query = `query: ${JSON.stringify(req.query)}`;
  if (req.params && Object.keys(req.params).length > 0)
    params = `params: ${JSON.stringify(req.params)}`;

  console.log(`${body} - ${query} - ${params}`);
});

const functions = {
  // affiliateInvite,
  // approvedPaymentNotifications,
  // blingShipping,
  // collaboratorsActivity,
  // confirmSplits,
  // exportSales,
  // exportSalesShipping,
  generatedNotifications,
  // importSalesShipping,
  // integrations,
  // requestWithdrawal,
  // sendNotifications,
  // splitCommissions,
  // studentApprovedPaymentEmails,
  // webhookEvent,
};

const app = express();

app.use(express.json());

app.use(morgan(':method :url :status :response-time ms - :res[content-length] :data'));

app.post('/:lambdaFunction', async (req, res) => {
  const {
    body,
    params: { lambdaFunction },
  } = req;
  const load = {
    Records: [
      {
        body: JSON.stringify(body),
      },
    ],
  };
  if (typeof functions[lambdaFunction] === 'function') functions[lambdaFunction](load);

  return res.sendStatus(200);
});

app.listen(process.env.PORT_SERVER, () => {
  console.log(`running on port ${process.env.PORT_SERVER}`);
});
