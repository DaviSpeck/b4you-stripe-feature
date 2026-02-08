import { AccountBalance } from './account-balance';
import { DisclosureLink } from './disclosure-link';
import b4yImage from '../../../../images/logo-horizontal.png';
import './style.scss';

export function Dashboard(props) {
  const { balance } = props;

  return (
    <div className='wrapper-page'>
      <DisclosureLink link={balance.code} />
      <AccountBalance
        availableBalance={balance.available_balance}
        outstandingBalance={balance.pending_balance ?? 0}
        registered={balance.active_referral}
      />
      <div className='wrapper-img'>
        <img src={b4yImage} />
      </div>
    </div>
  );
}
