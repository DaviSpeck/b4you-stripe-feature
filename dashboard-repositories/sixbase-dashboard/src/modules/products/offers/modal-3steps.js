import Form from 'react-bootstrap/Form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const ModalSelect3Steps = ({
  urlCheckout,
  handleCopyLink,
  forAffiliates,
  product,
  offer,
}) => {
  const shortLink = offer?.short_link || urlCheckout;
  const base = shortLink?.replace(/\/$/, '') || '';
  const final3Steps = `${base}/3Steps`;
  const final3StepsAffiliate = `${base}/1?steps=3steps`;

  return (
    <>
      {(product?.available_checkout_link_types === 'all' ||
        product?.available_checkout_link_types === 'single') && (
        <>
          <h5>Checkout Padrão</h5>
          <div className='d-flex'>
            <Form.Control
              defaultValue={base}
              readOnly
              style={{ borderRadius: '5px 0 0 5px', minWidth: 270 }}
              onClick={() => handleCopyLink(base)}
            />
            <ButtonDS
              className='ml-2'
              size='md'
              onClick={() => handleCopyLink(base)}
            >
              <i className='bx bx-copy-alt' />
            </ButtonDS>
          </div>
          <br />
        </>
      )}

      {(product?.available_checkout_link_types === 'all' ||
        product?.available_checkout_link_types === 'three-steps') && (
        <>
          <h5>Checkout em 3 Etapas</h5>
          <div className='d-flex'>
            <Form.Control
              defaultValue={forAffiliates ? final3StepsAffiliate : final3Steps}
              readOnly
              style={{ borderRadius: '5px 0 0 5px', minWidth: 270 }}
              onClick={() =>
                handleCopyLink(
                  forAffiliates ? final3StepsAffiliate : final3Steps
                )
              }
            />
            <ButtonDS
              size='md'
              className='ml-2'
              onClick={() =>
                handleCopyLink(
                  forAffiliates ? final3StepsAffiliate : final3Steps
                )
              }
            >
              <i className='bx bx-copy-alt' />
            </ButtonDS>
          </div>
        </>
      )}
    </>
  );
};

export default ModalSelect3Steps;
