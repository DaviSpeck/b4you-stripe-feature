import { Accordion } from 'react-bootstrap';
import { currency } from '../../functions';

const Rates = ({ data }) => {
  const putLabelNameRelease = (item) => {
    if (item === `card`) {
      return 'Cartão';
    }
    if (item === 'billet') {
      return 'Boleto';
    }
    if (item === 'pix') {
      return 'Pix';
    }
    return 'Indefinido';
  };
  const putLabelTempRelease = (item) => {
    if (item === 0) {
      return 'Instantâneo';
    }
    if (item === 1) {
      return item + ' dia';
    }
    if (item > 1) {
      return item + ' dias';
    }
    return 'Indefinido';
  };

  return (
    <>
      <div className='table-responsive'>
        <h4>Tarifas</h4>
        <div className='mb-3'>
          <table className='table mb-0'>
            <tbody>
              <tr>
                <td style={{ borderTop: 0 }}>Saque p/ Banco</td>
                <td style={{ borderTop: 0 }}>{currency(data?.withdrawal)}</td>
              </tr>
              <tr>
                <td>Venda em pix</td>
                <td>{`${currency(data?.fees.pix.variable)}% + ${currency(
                  data?.fees.pix.fixed
                )} por venda`}</td>
              </tr>
              <tr>
                <td>Venda em boleto</td>
                <td>{`${currency(data?.fees.billet.variable)}% + ${currency(
                  data?.fees.billet.fixed
                )} por venda`}</td>
              </tr>
              {data?.fees.card.length === 1 && (
                <tr>
                  <td>Venda em cartão</td>
                  <td>{`${currency(data?.fees.card[0].variable)}% + ${currency(
                    data?.fees.card[0].fixed
                  )} por venda`}</td>
                </tr>
              )}
            </tbody>
          </table>
          {data?.fees.card.length > 1 && (
            <Accordion
              defaultActiveKey={null}
              className='w-100'
              style={{
                padding: 0,
                border: `1px solid #dadce0`,
                borderRadius: 4,
              }}
            >
              <Accordion.Toggle
                eventKey='0'
                style={{
                  padding: `12px 20px`,
                  fontSize: 14,
                  background: `transparent`,
                  border: `0`,
                  color: `#464950`,
                }}
                className='d-flex justify-content-between  align-items-center w-100'
              >
                <div>Venda em cartão</div>
                <div>
                  <i class='bx bx-chevron-down' style={{ fontSize: 21 }}></i>
                </div>
              </Accordion.Toggle>
              <Accordion.Collapse
                eventKey='0'
                style={{
                  padding: `12px 20px`,
                  fontSize: 14,
                  background: `transparent`,
                  border: `0`,
                  borderTop: `1px solid #dadce0`,
                  color: `#464950`,
                }}
              >
                <div>
                  <tr>
                    <td
                      style={{ borderTop: 0, fontWeight: `500` }}
                      className='pb-1'
                    >
                      Parcelas
                    </td>
                  </tr>
                  {data?.fees.card.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td className='pt-1'>{index + 1}x</td>
                        <td className='pt-1'>
                          <small>
                            {' '}
                            {`${currency(item.variable)}% + ${currency(
                              item.fixed
                            )}`}{' '}
                            por venda
                          </small>
                        </td>
                      </tr>
                    );
                  })}
                </div>
              </Accordion.Collapse>
            </Accordion>
          )}
        </div>

        <h4 className='mt-4'>Prazo de Recebimento</h4>
        <table className='table'>
          <tbody>
            {data && (
              <tr>
                {Object.keys(data.releases).map((item, index) => (
                  <td key={index} style={{ borderTop: 0 }} width='33.33%'>
                    <b className='d-block'>{putLabelNameRelease(item)}</b>{' '}
                    {putLabelTempRelease(data?.releases[item])}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Rates;
