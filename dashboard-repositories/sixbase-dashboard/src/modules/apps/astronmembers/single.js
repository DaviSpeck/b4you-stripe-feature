import { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import logoAstron from '../../../images/apps/astron.svg';
import { notify } from '../../functions';
import ModalPlugin from './modal-plugin';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsListAstronmembersSingle = () => {
  const [showModal, setShowModal] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const { uuidIntegration } = useParams();

  useEffect(() => {
    if (showModal === false) {
      fetchData();
    }
  }, [showModal]);

  const fetchData = () => {
    api
      .get(`/integrations/astronmembers/${uuidIntegration}`)
      .then((response) => {
        setIntegrations(response.data.plugins);
      })
      .catch(() => {});
  };

  const handleRemove = (item) => {
    api
      .delete(`/integrations/astronmembers/${uuidIntegration}/${item.uuid}`)
      .then(() => {
        notify({
          message: 'Regra removida com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao remover regra',
          type: 'error',
        });
      })
      .finally(() => {
        fetchData();
      });
  };

  return (
    <>
      <ModalGeneric
        show={showModal}
        setShow={setShowModal}
        title='Nova Regra'
        centered
      >
        <ModalPlugin setShow={setShowModal} uuidIntegration={uuidIntegration} />
      </ModalGeneric>
      <PageTitle
        title='Astron Members'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: '/apps/astronmembers', text: `Astron Members` },
        ]}
      />

      <section id='page-apps'>
        <img src={logoAstron} className='logo-app' alt='' />

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Evento</th>
                  <th style={{ textAlign: `center` }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.product.name}</td>
                      <td>{item.id_rule.label}</td>
                      <td className='d-flex justify-content-center'>
                        <ButtonDS
                          size='icon'
                          variant='danger'
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
                {integrations.length === 0 && (
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

export default PageAppsListAstronmembersSingle;
