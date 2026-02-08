import { Avatar } from '@material-ui/core';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { formattedFullName, formattedName } from '../../../utils/formattedName';
import { currency } from '../../functions';

export const CardAffiliations = ({ item, img, colorBorder, loading }) => {
  return (
    <Card
      className='w-100'
      style={{
        border: `1px solid ${colorBorder}`,
      }}
    >
      <Card.Body
        className='d-flex flex-column flex-md-row align-items-center justify-content-center gap-small position-relative'
        style={{ gap: 20 }}
      >
        <img
          src={img}
          alt='Gold Medal'
          width='50'
          height='50'
          className='position-absolute'
          style={{
            top: '0px',
            left: '20px',
            zIndex: 1,
          }}
        />

        <Avatar
          src={loading ? '' : item?.profile_picture}
          style={{
            width: '60px',
            height: '60px',
          }}
        />

        <div>
          <OverlayTrigger
            placement='top'
            overlay={
              <Tooltip id={`tooltip-top`}>
                {!loading && formattedFullName(item?.affiliate_name ?? '')}
              </Tooltip>
            }
          >
            <h6
              className='mt-3'
              style={{
                maxWidth: '20ch',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {loading
                ? 'Carregando...'
                : formattedName(item?.affiliate_name ?? '')}
            </h6>
          </OverlayTrigger>
          <p className='text-muted' style={{ marginBottom: '0px !important' }}>
            {loading ? 'R$ 0,00' : currency(item?.total_sales_value)}
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};
