import { Avatar } from '@material-ui/core';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import BadgeDS from '../../../jsx/components/design-system/BadgeDS';
import { formattedFullName, formattedName } from '../../../utils/formattedName';
import { currency } from '../../functions';

const CardCreator = ({ item, color, img, loading }) => {
  return (
    <Card
      style={{
        border: `1px solid ${color}`,
      }}
    >
      <Card.Body
        className='d-flex flex-row align-items-center justify-content-center position-relative card-body-small'
        style={{ gap: 16 }}
      >
        <img
          src={img}
          alt='Imagem da medalha'
          width='60'
          height='60'
          className='position-absolute'
          style={{
            top: '0px',
            left: '10px',
            zIndex: 1,
          }}
        />

        <div className='d-flex flex-column align-items-center justify-content-center'>
          <Avatar
            src={loading ? '' : item?.profile_picture}
            style={{
              width: '72px',
              height: '72px',
              marginBottom: '10px',
            }}
          />

          <BadgeDS variant='ranking' size='lg'>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top`}>{item?.coupon || '---'}</Tooltip>
              }
            >
              <p
                style={{
                  maxWidth: '12ch',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: 0,
                }}
              >
                <span style={{ fontWeight: '700', fontSize: '10px' }}>
                  {loading ? 'Carregando...' : item?.coupon || '---'}
                </span>
              </p>
            </OverlayTrigger>
          </BadgeDS>
        </div>

        <div className='d-flex flex-column align-items-center align-items-sm-start justify-content-center'>
          <OverlayTrigger
            placement='top'
            overlay={
              <Tooltip id={`tooltip-top`}>
                {formattedFullName(item?.affiliate_name)}
              </Tooltip>
            }
          >
            <h6
              className='mt-0 mb-2'
              style={{
                maxWidth: '20ch',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#475569',
                fontSize: '16px',
              }}
            >
              <span style={{ fontWeight: '600', color: '#475569' }}>
                {loading
                  ? 'Carregando...'
                  : formattedName(item?.affiliate_name)}
              </span>
            </h6>
          </OverlayTrigger>

          <p className='text-muted mb-0'>
            <span
              style={{
                fontWeight: '600',
                color: '#475569',
              }}
            >
              {loading
                ? 'R$ 0,00'
                : item?.total_sales
                ? `${currency(item?.total_sales)}`
                : 'R$ 0,00'}
            </span>
          </p>

          <p className='text-muted'> de faturamento</p>

          <p
            className='text-muted mb-0'
            style={{ marginBottom: '0px !important' }}
          >
            <span style={{ fontWeight: '600', color: '#475569' }}>
              {loading ? '0 ' : item?.total_sold || '0'}
            </span>
            <span> vendas</span>
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CardCreator;
