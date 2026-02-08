import { useEffect, useState } from 'react';
import { Card, Spinner, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import logoActiveCampaign from '../../../images/apps/activecampaign.png';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import ModalRule from './modal-rule';

const PageAppsListActiveCampaignSingle = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState([]);

  const { uuidIntegration } = useParams();

  const fetchData = () => {
    setLoading(true);

    api
      .get(`/integrations/activecampaign/${uuidIntegration}`)
      .then((response) => {
        setCredentials(response.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRemove = (item) => {
    setLoading(true);

    api
      .delete(`/integrations/activecampaign/${uuidIntegration}/${item.uuid}`)
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        fetchData();
      });
  };

  useEffect(() => {
    if (showModal === false) {
      fetchData();
    }
  }, [showModal]);

  return (
    <>
      <ModalGeneric
        show={showModal}
        setShow={setShowModal}
        title='Nova Credencial'
        centered
      >
        <ModalRule setShow={setShowModal} uuidIntegration={uuidIntegration} />
      </ModalGeneric>

      <PageTitle
        title='Active Campaign'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: '/apps/active-campaign', text: `Active Campaign` },
        ]}
      />

      <section id='page-apps'>
        <img src={logoActiveCampaign} className='logo-app' alt='' />

        <Card className='mt-4'>
          <Card.Body>
            {loading ? (
              <div
                className='d-flex justify-content-center align-items-center'
                style={{ height: '200px' }}
              >
                <Spinner animation='border' />
                <span className='ml-2'>
                  Carregando dados do Active Campaign...
                </span>
              </div>
            ) : (
              <Table responsive>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Evento</th>
                    <th>Ação</th>
                    <th>Lista</th>
                    <th>Tags</th>
                    <th width='100'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td style={{ minWidth: '180px' }}>
                          {item.product_name}
                        </td>
                        <td>{item.event}</td>
                        <td>
                          {item.insert_list === 1 ? 'Inserir' : 'Remover'}
                        </td>
                        <td>{item.list_name}</td>

                        <td style={{ maxWidth: '280px' }}>
                          {item.tags_name.length > 0 ? (
                            <div
                              class='d-flex align-items-center flex-wrap'
                              style={{
                                gap: 4,
                              }}
                            >
                              {item.tags_name.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  class='badge badge-pill badge-info'
                                  style={{
                                    fontSize: '10px',
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            'Sem tags'
                          )}
                        </td>

                        <td className='d-flex justify-content-center'>
                          <ButtonDS
                            variant='danger'
                            size='icon'
                            onClick={() => {
                              handleRemove(item);
                            }}
                          >
                            <i className='bx bx-x'></i>
                          </ButtonDS>
                        </td>
                      </tr>
                    );
                  })}

                  {credentials.length === 0 && (
                    <tr>
                      <td colSpan='100' className='text-center'>
                        Não há regras cadastradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        <div className='mt-4'>
          <ButtonDS
            size='sm'
            onClick={() => {
              setShowModal(true);
            }}
          >
            Nova Regra
          </ButtonDS>
        </div>
      </section>
    </>
  );
};

export default PageAppsListActiveCampaignSingle;
