import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Table } from 'react-bootstrap';
import logoTiny from '../../../images/apps/tiny.png';
import PageTitle from '../../../jsx/layouts/PageTitle';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import ModalCredential from './modal-credential';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsTiny = () => {
  const { reset } = useForm({
    mode: 'onChange',
  });
  const [requesting, setRequesting] = useState(false);
  const [credentials, setCredentials] = useState([]);
  // const [activeCredential, setActiveCredential] = useState(null);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const shippingOptionsMap = {
    C: "Correios",
    T: "Transportadora",
    M: "Mercado Envios",
    E: "Correios E-fulfillment",
    B: "B2W Entrega",
    X: "Customizada",
    D: "ConectaLá Etiquetas",
    J: "Jadlog",
    S: "Sem Frete",
    TOTALEXPRESS: "Total Express",
    OLIST: "Olist",
    GATEWAY: "Gateway logístico",
    MAGALU_ENTREGAS: "Magalu Entregas",
    MAGALU_FULFILLMENT: "Magalu Fulfillment",
    SHOPEE_ENVIOS: "Shopee Envios",
    NS_ENTREGAS: "Netshoes Entregas",
    VIAVAREJO_ENVVIAS: "Via Varejo Envvias",
    ALI_ENVIOS: "AliExpress Envios",
    MADEIRA_ENVIOS: "Madeira Envios",
    LOGGI: "Loggi",
    AMAZON_DBA: "Amazon DBA",
    NS_MAGALU_ENTREGAS: "Magalu Entregas por Netshoes",
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = () => {
    setRequesting(true);
    api
      .delete(`/integrations/tiny/`)
      .then(() => {
        fetchData();
        setModalCancelShow(false);
        notify({
          message: 'Credencial removida com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao remover a credencial',
          type: 'error',
        });
      })
      .finally(() => setRequesting(false));
  };

  const fetchData = () => {
    setRequesting(true);
    api
      .get('/integrations/tiny')
      .then((response) => {
        setCredentials(response.data);
        reset(response.data.settings);
      })
      .catch((err) => {
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  return (
    <>
      <PageTitle
        title='Tiny'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: null, text: 'Tiny' },
        ]}
      />
      <ModalGeneric
        show={showModal}
        setShow={setShowModal}
        title={'Nova Credencial'}
        centered
      >
        <ModalCredential setShow={setShowModal} fetchData={fetchData} />
      </ModalGeneric>

      <section id='page-apps'>
        <img src={logoTiny} className='logo-app' alt='Frenet' />
        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th width='50' className='text-center'>
                    Status
                  </th>
                  <th width='100' className='text-center'>
                    Token
                  </th>
                  <th width='150' className='text-center'>
                    Método de envio
                  </th>
                  <th width='100' className='text-center'>
                    Transportadora
                  </th>
                  <th width='100' className='text-center'>
                    Descrição
                  </th>
                  <th width='100' className='text-center'>
                    Natreza da operação
                  </th>
                  <th width='100' className='text-center'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {!requesting &&
                  credentials.map((item, index) => {
                    return (
                      <tr className='text-center' key={index}>
                        <td className='d-flex justify-content-center'>
                          <div>
                            {item.active ? (
                              <ButtonDS size='icon' variant='success'>
                                <i
                                  className='bx bx-check'
                                  style={{ fontSize: 22 }}
                                ></i>
                              </ButtonDS>
                            ) : (
                              <ButtonDS size='icon' variant='danger'>
                                <i
                                  className='bx bx-error'
                                  style={{ fontSize: 20 }}
                                ></i>
                              </ButtonDS>
                            )}
                          </div>
                        </td>

                        <td>{item.token}</td>
                        <td>{shippingOptionsMap[item.methods_shipping] || item.methods_shipping}</td>
                        <td>{item.shipping_service}</td>
                        <td>{item.descricao}</td>
                         <td>{item.operation_nature}</td>
                        <td className='d-flex justify-content-center'>
                          <ButtonDS
                            size='icon'
                            variant='danger'
                            onClick={() => {
                              setModalCancelShow(true);
                            }}
                          >
                            <i className='bx bx-trash-alt'></i>
                          </ButtonDS>
                        </td>
                      </tr>
                    );
                  })}
                {credentials.length === 0 && !requesting && (
                  <tr>
                    <td colSpan='100' className='text-center'>
                      Não há integrações cadastradas.
                    </td>
                  </tr>
                )}
                {requesting && (
                  <tr>
                    <td colSpan='100' className='text-center'>
                      <i
                        className='bx bx-loader-alt bx-spin'
                        style={{ fontSize: 40 }}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        <div className='mt-4'>
          {credentials.length === 0 && (
            <ButtonDS
              size='sm'
              onClick={() => {
                setShowModal(true);
              }}
            >
              Nova Integração
            </ButtonDS>
          )}
        </div>
        {modalCancelShow && (
          <ConfirmAction
            title={'Remover Integração'}
            show={modalCancelShow}
            setShow={setModalCancelShow}
            handleAction={handleDelete}
            buttonText={'Remover'}
            centered
          />
        )}
      </section>
    </>
  );
};

export default PageAppsTiny;