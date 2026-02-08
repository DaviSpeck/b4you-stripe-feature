import { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import { PiEyeClosedLight } from 'react-icons/pi';
import { VscEye } from 'react-icons/vsc';
import { currency } from '../../functions';

export const SaleStatusSummary = (props) => {
  const [isShowValue, setIsShowValue] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    loading,
    mainValue,
    subInformation,
    fieldName,
    isCurrency = true,
  } = props;

  let CurrencyValueToShow = isCurrency ? currency(mainValue) : mainValue;

  if (!isShowValue && isMobile) CurrencyValueToShow = '********';

  useEffect(() => {
    if (window.innerWidth <= 767) setIsMobile(true);

    addEventListener('resize', () => {
      if (window.screen.width <= 767) {
        setIsMobile(true);
      }

      if (window.screen.width > 767) {
        setIsMobile(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fieldsVisable = JSON.parse(
      window.localStorage.getItem('fields-visable') ?? '{}'
    );

    fieldsVisable[fieldName] = isShowValue;

    window.localStorage.setItem(
      'fields-visable',
      JSON.stringify(fieldsVisable)
    );
  }, [isShowValue]);

  useEffect(() => {
    const fieldsVisable = JSON.parse(
      window.localStorage.getItem('fields-visable') ?? '{}'
    );

    setIsMounted(true);

    if (fieldName in fieldsVisable) {
      setIsShowValue(fieldsVisable[fieldName]);
    }
  }, [mainValue]);

  return (
    <Col md={3} sm={12}>
      <div className='card bg-success'>
        {isMobile && (
          <button
            onClick={() => setIsShowValue((prevValue) => !prevValue)}
            style={{
              backgroundColor: 'transparent',
              width: 'auto',
              height: 'auto',
              border: 'none',
            }}
          >
            {isShowValue ? (
              <VscEye
                size={22}
                style={{
                  fontWeight: '600',
                  position: 'absolute',
                  right: '16px',
                  top: '16px',
                }}
              />
            ) : (
              <PiEyeClosedLight
                size={20}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '16px',
                }}
              />
            )}
          </button>
        )}

        <div className='card-body p-3 d-flex flex-column justify-content-center'>
          <h2 className='fs-24 font-w600 mb-0'>
            {!loading &&
              (mainValue !== null || mainValue !== undefined) &&
              CurrencyValueToShow}
            {loading && (
              <i
                className='bx bx-loader-alt bx-spin'
                style={{ fontSize: 25 }}
              />
            )}
          </h2>
          <span className='fs-14'>
            {!loading && subInformation}
            {loading && (
              <i
                className='bx bx-loader-alt bx-spin'
                style={{ fontSize: 25 }}
              />
            )}
          </span>
        </div>
      </div>
    </Col>
  );
};
