import { Configs } from './config';
import './style.scss';

export const NativeUpsell = (props) => {
  const { isLoading, upsellData, isUpsellProduct } = props;
  return (
    <Configs
      isLoading={isLoading}
      upsellData={upsellData}
      isUpsellProduct={isUpsellProduct}
    />
  );
};

// eslint-disable-next-line react/display-name
NativeUpsell.SwitchInput = (props) => {
  const { label, ...otherProps } = props;

  return (
    <div className='wrapper-switch'>
      <label class='switch'>
        <input type='checkbox' {...otherProps} />
        <span class='slider round'></span>
      </label>
      <span>{label}</span>
    </div>
  );
};
