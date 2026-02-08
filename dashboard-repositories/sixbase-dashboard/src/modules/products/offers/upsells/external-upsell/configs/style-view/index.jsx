export const StyleView = (props) => {
  const {
    isRemoveBorders,
    colorUpsell,
    colorAcceptUpsell,
    fontSizeUpsell,
    textAcceptUpsell,
    colorRefuseUpsell,
    fontSizeUpsellRefused,
    textRefuseUpsell,
  } = props;

  return (
    <div
      className='buttons-root'
      style={
        isRemoveBorders
          ? {
              border: 'unset',
            }
          : {
              backgroundColor: 'rgba(240,241,245,1)',
            }
      }
    >
      <div className='buttons-container'>
        <button
          id='acceptUpsell'
          className='accept-upsell'
          style={{
            backgroundColor: `${colorUpsell}`,
            color: `${colorAcceptUpsell}`,
            fontSize: `${fontSizeUpsell}px`,
          }}
        >
          {textAcceptUpsell}
        </button>
        <div
          className='refuse-upsell'
          id='refuseUpsell'
          style={{
            color: `${colorRefuseUpsell}`,
            fontSize: `${fontSizeUpsellRefused}px`,
          }}
        >
          {textRefuseUpsell}
        </div>
      </div>
    </div>
  );
};
