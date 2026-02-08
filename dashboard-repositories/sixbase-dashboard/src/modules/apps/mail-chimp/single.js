import { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import logoMailChimp from '../../../images/apps/mailchimp.png';
import { useParams } from 'react-router-dom';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import ModalRule from './modal-rule';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsListMailChimpSingle = () => {
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const { uuidIntegration } = useParams();

  const fetchData = () => {
    api
      .get(`/integrations/mailchimp/${uuidIntegration}`)
      .then((response) => {
        setCredentials(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (showModal === false) {
      fetchData();
    }
  }, [showModal]);

  const handleRemove = (item) => {
    api
      .delete(`/integrations/mailchimp/${uuidIntegration}/${item.uuid}`)
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        fetchData();
      });
  };

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
        title='Mail Chimp'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: '/apps/mail-chimp', text: `Mail Chimp` },
        ]}
      />

      <section id='page-apps'>
        <img src={logoMailChimp} className='logo-app' alt='' />

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Evento</th>
                  <th>Ação</th>
                  <th>Lista</th>
                  <th width='100'>Ações</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.product_name}</td>
                      <td>{item.event}</td>
                      <td>{item.insert_list === 1 ? 'Inserir' : 'Remover'}</td>
                      <td>{item.list_name}</td>
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

export default PageAppsListMailChimpSingle;
