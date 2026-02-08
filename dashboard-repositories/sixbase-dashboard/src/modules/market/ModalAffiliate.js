import { Modal, OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';

const ModalAffiliate = ({
  response,
  product,
  show,
  setShow,
  setAccept,
  accept,
  requesting,
  handleAffiliation,
  productsGlobalAffiliation,
}) => {
  return (
    <Modal
      show={show}
      setShow={setShow}
      onHide={() => setShow(false)}
      footer={false}
      size={'lg'}
      id='modal-affiliate'
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Afiliação em {product?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {productsGlobalAffiliation.length > 0 && (
          <>
            <div className='d-flex w-100 mb-2 align-items-center'>
              <h4 className='mb-0'>Afiliação global</h4>
              <OverlayTrigger
                placement='top'
                overlay={
                  <Tooltip id={`tooltip-top-invisible-offer`}>
                    Pensamos nisso para que você possa receber suas comissões
                    corretamente nas vendas realizadas por meio de upsell e
                    orderbump, além de ter os outros produtos da linha
                    disponíveis para divulgação.
                  </Tooltip>
                }
              >
                <i className='bx bx-info-circle ml-2'></i>
              </OverlayTrigger>
            </div>
            <div className='alert d-flex'>
              <span>Ao ter a sua solicitação confirmada,</span>
              <b className='mb-0 ml-1 mr-1'>
                você estará se afiliando automaticamente
              </b>
              <span>aos seguintes produtos da linha:</span>
            </div>

            <Table className='mt-3 mb-3'>
              <ul id='custom-ul'>
                {productsGlobalAffiliation.map((item, index) => {
                  return <li key={index}>{item.name}</li>;
                })}
              </ul>
            </Table>
          </>
        )}
        {response === null && (
          <>
            <div className='alert'>
              <b>
                Leia atentamente as ações que não podem ser praticadas por quem
                se afilia a produtos na B4you:
              </b>
              <ul>
                <li>
                  Não faça SPAM; Não envie mensagens em massa em apps como
                  WhatsApp e Telegram.
                </li>
                <li>
                  Não use a marca da B4you em divulgações enquanto Afiliado(a)
                  ou que pareçam que o produto pertence à B4you, e não ao
                  Produtor ou Produtora;
                </li>
                <li>
                  Não ofereça ou prometa benefícios diferentes dos quais o
                  produto oferece e/ou resultados garantidos.
                </li>
              </ul>
            </div>
            <Table>
              <tr>
                <td width='50%'>Tipo de Afiliação</td>
                <td>
                  {product?.manual_approval === 0
                    ? 'Imediata'
                    : 'Sob Aprovação'}
                </td>
              </tr>
              <tr>
                <td>Comissão</td>
                <td>{product?.commission_percentage}%</td>
              </tr>
              <tr>
                <td>Regra de Comissionamento</td>
                <td>
                  Por{' '}
                  {product?.click_attribution === 'first-click'
                    ? 'Primeiro '
                    : 'Último '}
                  Click
                </td>
              </tr>
              <tr>
                <td>Possui adesão?</td>
                <td>{product?.subscription_fee ? 'Sim' : 'Não'}</td>
              </tr>
              {!!product?.subscription_fee && (
                <>
                  <tr>
                    <td>Comissão na adesão</td>
                    <td>{product?.subscription_fee_commission}%</td>
                  </tr>
                  <tr>
                    <td>Regra de comissão</td>
                    <td>
                      {product?.subscription_fee_only
                        ? 'Apenas na adesão'
                        : 'Adesão + Recorrência'}
                    </td>
                  </tr>
                </>
              )}
              <tr>
                <td>Validade dos Cookies</td>
                <td>
                  {product?.cookies_validity === 0
                    ? 'Eterno'
                    : `${product?.cookies_validity} dias`}
                </td>
              </tr>
            </Table>

            <div className='accept'>
              <input
                type='checkbox'
                id='check'
                defaultChecked={accept}
                onChange={() => {
                  setAccept(!accept);
                }}
              />
              <label htmlFor='check'>
                Li e concordo com os{' '}
                <a
                  href='https://b4you.com.br/legal.html'
                  target='_blank'
                  rel='noreferrer'
                >
                  Termos de Uso do Programa de Afiliados
                </a>
              </label>
            </div>
            <div className='d-flex justify-content-between mt-4'>
              <ButtonDS
                size='sm'
                variant='light'
                className='mr-4'
                onClick={() => {
                  setShow(false);
                }}
              >
                Cancelar
              </ButtonDS>
              <ButtonDS
                size='sm'
                disabled={!accept || requesting}
                onClick={handleAffiliation}
              >
                {!requesting ? 'Confirmar Afiliação' : 'afiliando-se...'}
              </ButtonDS>
            </div>
          </>
        )}
        {response === 'success' && (
          <>
            <div className='text-center'>
              <i
                className='la la-thumbs-up text-success'
                style={{ fontSize: 40 }}
              />
              <h2 className='text-success mb-4'>Sucesso</h2>
              <p>
                Parabéns! Você acaba de se tornar um afiliado do produto{' '}
                <b>{product?.name}</b>. A partir de agora os seus links para
                venda já estão disponíveis para você começar a faturar. Boas
                vendas!
              </p>
              <small>
                Lembre-se sempre de seguir as regras da B4you e também as regras
                que o produtor definiu.
              </small>
            </div>
          </>
        )}
        {response === 'pending' && (
          <>
            <div className='text-center'>
              <i className='la la-clock text-info' style={{ fontSize: 40 }} />
              <h2 className='text-info mb-4'>Pendente</h2>
              <p>
                A sua solicitação para afiliar-se à <b>{product?.name}</b> está
                pendente e aguardando aprovação do produtor. Assim que
                recebermos um retorno, você será notificado.
              </p>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ModalAffiliate;
