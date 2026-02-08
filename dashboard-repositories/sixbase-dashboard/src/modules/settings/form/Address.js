import { Divider } from '@material-ui/core';
import FiscalAddressForm from './FiscalAddressForm';
import PrizeAddressForm from './PrizeAddressForm';

const Address = ({ data, setData }) => {
  return (
    <>
      <FiscalAddressForm data={data} setData={setData} />
      <Divider style={{ margin: '3rem 0' }} />
      <PrizeAddressForm data={data} setData={setData} />
    </>
  );
};

export default Address;
