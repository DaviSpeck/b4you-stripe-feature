import PageTitle from '../../../jsx/layouts/PageTitle';
import logoVoxuy from '../../../images/apps/voxuy.png';
import { Card, Table } from 'react-bootstrap';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../providers/api';
import ModalPlugin from './modal-plugin';
import { notify } from '../../functions';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const PageAppsListVoxuySingle = () => {
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
      .get(`/integrations/voxuy/${uuidIntegration}`)
      .then((response) => {
        setIntegrations(response.data.plugins);
      })
      .catch(() => {});
  };

  const handleRemove = (item) => {
    api
      .delete(`/integrations/voxuy/${uuidIntegration}/${item.uuid}`)
      .then(() => {
        notify({
          message: 'Regra removida com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao remover regra',
          type: 'success',
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
        title='Voxuy'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: '/apps/voxuy', text: `Voxuy` },
        ]}
      />

      <section id='page-apps'>
        <img src={logoVoxuy} className='logo-app' alt='' />

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Plano</th>
                  <th>Produto</th>
                  <th>Evento</th>
                  <th className='text-center'>Ações</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.settings.plan_id}</td>
                      <td>{item.product.name}</td>
                      <td>{item.id_rule.label}</td>
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

export default PageAppsListVoxuySingle;
