import { Charges } from './Charges.mjs';
import { Products } from './Products.mjs';
import { Sales_items } from './Sales_items.mjs';
import { StudentProducts } from './StudentProducts.mjs';
import { Transactions } from './Transactions.mjs';
import { Balances } from './Balances.mjs';
import { Sales_items_transactions } from './SalesItemsTransactions.mjs';
import { ReferralCommissions } from './ReferralCommissions.mjs';
import { ReferralBalance } from './ReferralBalance.mjs';
import { Subscriptions } from './Subscriptions.mjs';
import { BalanceHistory } from './BalanceHistory.mjs';
import { Sales_items_charges } from './SalesItemsCharges.mjs';
import { Commissions } from './Commissions.mjs';
import { Blacklist } from './Blacklist.mjs';
import { Sales } from './Sales.mjs';

export const models = [
  Commissions,
  Sales_items_charges,
  Balances,
  BalanceHistory,
  Subscriptions,
  ReferralBalance,
  ReferralCommissions,
  Sales_items_transactions,
  Charges,
  Products,
  Sales_items,
  StudentProducts,
  Transactions,
  Blacklist,
  Sales,
];
