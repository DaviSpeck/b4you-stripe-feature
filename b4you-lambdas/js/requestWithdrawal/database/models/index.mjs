import { Sales_items } from './Sales_items.mjs';
import { Sales_items_transactions } from './Sales_items_transactions.mjs';
import { Transactions } from './Transactions.mjs';
import { Users } from './Users.mjs';
import { Balances } from './Balances.mjs';
import { Cost_central } from './Cost_central.mjs';
import { Taxes } from './Taxes.mjs';
import { Withdrawals } from './Withdrawals.mjs';
import { Withdrawals_settings } from './Withdrawals_settings.mjs';
import { Affiliates } from './Affiliates.mjs';
import { Products } from './Products.mjs';
import { Coproductions } from './Coproductions.mjs';
import { UsersRevenue } from './UsersRevenue.mjs';
import { Commissions } from './Commissions.mjs';
import { ReferralBalance } from './ReferralBalances.mjs';
import { User_activity } from './UserActivity.mjs';

export const models = [
  User_activity,
  ReferralBalance,
  Commissions,
  UsersRevenue,
  Affiliates,
  Products,
  Coproductions,
  Sales_items,
  Sales_items_transactions,
  Transactions,
  Users,
  Balances,
  Cost_central,
  Taxes,
  Withdrawals,
  Withdrawals_settings,
];
