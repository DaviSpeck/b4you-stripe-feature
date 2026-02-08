import PageTitle from '../../../jsx/layouts/PageTitle';
import logoInvision from '../../../images/apps/invision.png';
import { Card, Col, FormControl, FormGroup, Row, Table } from 'react-bootstrap';
import ModalGeneric from '../../../jsx/components/ModalGeneric';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../providers/api';
import { notify } from '../../functions';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { Label } from 'react-konva';

const PageAppsListInvisionSingle = () => {
  const [showModal, setShowModal] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [data, setData] = useState([]);
  const [requesting, setRequesting] = useState(true);
  const [fields, setFields] = useState({});
  const { uuidIntegration } = useParams();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchDataModal();
  }, [showModal]);

  const fetchData = () => {
    api
      .get(`/integrations/invision/${uuidIntegration}`)
      .then((response) => {
        setData(response.data);
      })
      // eslint-disable-next-line
      .catch((err) => console.log(err))
      .finally(() => setRequesting(false));
  };

  const fetchDataModal = () => {
    api
      .get(`/integrations/invision/info/${uuidIntegration}`)
      .then((response) => {
        setIntegrations(response.data);
      })
      // eslint-disable-next-line
      .catch((err) => console.log(err))
      .finally(() => setRequesting(false));
  };

  const handleRemove = (item) => {
    api
      .delete(`/integrations/invision/${uuidIntegration}/${item.uuid}`)
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

  useEffect(() => {
    if (!showModal) {
      setFields({});
    }
  }, [showModal]);

  const onSubmit = () => {
    api
      .post(`/integrations/invision/${uuidIntegration}`, fields)
      .then(() => {
        fetchData();
        setShowModal(false);
        notify({
          message: 'Regra criada com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao criar regra',
          type: 'success',
        });
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
        <FormGroup>
          <Label>Produto</Label>
          <FormControl
            as='select'
            name='uuid_product'
            onChange={(e) =>
              setFields({ ...fields, uuid_product: e.target.value })
            }
          >
            <option value=''>Selecionar</option>
            {integrations.length !== 0 &&
              integrations.products.map((item) => {
                return (
                  <option key={item.uuid} value={item.uuid}>
                    {item.name}
                  </option>
                );
              })}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <Label>Grupo primário</Label>
          <FormControl
            as='select'
            name='id_list_primary'
            onChange={(e) => {
              const selectedOption =
                integrations.groups.find((g) => g.id === +e.target.value) || '';
              setFields({
                ...fields,
                id_list_primary: e.target.value,
                name_list_primary: selectedOption?.name,
              });
            }}
          >
            <option value=''>Selecionar</option>
            {integrations.length !== 0 &&
              integrations.groups.map((item) => {
                return (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                );
              })}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <Label>Grupo secundário</Label>
          <FormControl
            as='select'
            name='secondary'
            onChange={(e) => {
              const selectedOption =
                integrations.groups.find((g) => g.id === +e.target.value) || '';
              setFields({
                ...fields,
                id_list_secondary: e.target.value,
                name_list_secondary: selectedOption?.name,
              });
            }}
          >
            <option value=''>Selecionar</option>
            {integrations.length !== 0 &&
              integrations.groups.map((item) => {
                return (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                );
              })}
          </FormControl>
        </FormGroup>
        <Row className='mt-4'>
          <Col className='d-flex justify-content-end'>
            <ButtonDS
              disabled={
                !fields?.uuid_product ||
                !fields?.id_list_primary ||
                !fields?.name_list_primary ||
                !fields?.id_list_secondary ||
                !fields?.name_list_secondary
              }
              onClick={onSubmit}
            >
              Criar regra
            </ButtonDS>
          </Col>
        </Row>
      </ModalGeneric>
      <PageTitle
        title='Invision'
        path={[
          { url: '/apps', text: 'Apps' },
          { url: '/apps/invision', text: `Invision` },
        ]}
      />

      <section id='page-apps'>
        <img src={logoInvision} className='logo-app' alt='' />

        <Card className='mt-4'>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Primária</th>
                  <th>Secundária</th>
                  <th className='text-center'>Ação</th>
                </tr>
              </thead>
              <tbody>
                {!requesting &&
                  data.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{item.product.name}</td>
                        <td>{item.name_list_primary}</td>
                        <td>{item.name_list_secondary}</td>
                        <td className='d-flex justify-content-center'>
                          <ButtonDS
                            variant='danger'
                            size='icon'
                            onClick={() => {
                              handleRemove(item);
                            }}
                          >
                            <i className='bx bx-trash-alt'></i>
                          </ButtonDS>
                        </td>
                      </tr>
                    );
                  })}
                {!requesting && data.length === 0 && (
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

export default PageAppsListInvisionSingle;
