import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import { Col, Row, Table } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import FilterListing from '../../jsx/components/FilterListing';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import { useUser } from '../../providers/contextUser';
import formatDate from '../../utils/formatters';
import Loader from '../../utils/loader';
import { notify } from '../functions';
import NoDataComponentContent from '../NoDataComponentContent';
import Actions from './actions';
import AffiliateInfo from './AffiliateInfo';
import { useHistory } from 'react-router-dom';
import { ModalExport } from '../sales/components/ModalExport';

const parseInstagram = (instagram, instagram_link) => {
  if (instagram_link) {
    return {
      label: instagram || instagram_link,
      href: instagram_link,
    };
  }
  if (!instagram) return null;
  const raw = String(instagram).trim();
  const cleaned = raw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/\/.*/, '')
    .replace(/^@/, '')
    .trim();
  if (!cleaned) return null;
  return {
    label: `@${cleaned}`,
    href: `https://instagram.com/${cleaned}`,
  };
};

const parseTikTok = (tiktok, tiktok_link) => {
  if (tiktok_link) {
    return {
      label: tiktok || tiktok_link,
      href: tiktok_link,
    };
  }
  if (!tiktok) return null;
  const raw = String(tiktok).trim();
  const cleaned = raw
    .replace(/^https?:\/\/(www\.)?tiktok\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*/, '')
    .trim();
  if (!cleaned) return null;
  return {
    label: `@${cleaned}`,
    href: `https://www.tiktok.com/@${cleaned}`,
  };
};

const columns = memoizeOne((renderActions) => [
  {
    name: <RenderNameDataTable name='Produto' iconClassName='bx bx-cube' />,
    cell: (item) => item.product.name,
    sortable: true,
  },
  {
    name: <RenderNameDataTable name='Afiliado' iconClassName='bx bx-user' />,
    cell: (item) => (
      <div>
        <div>{item.user}</div>
        <div>{item.email}</div>
      </div>
    ),
    sortable: true,
  },
  {
    name: (
      <RenderNameDataTable
        name='Instagram'
        iconClassName='bx bxl-instagram'
      />
    ),
    cell: (item) => {
      const ig = parseInstagram(item.instagram, item.instagram_link);
      if (!ig) return '-';
      return (
        <a href={ig.href} target='_blank' rel='noreferrer'>
          {ig.label}
        </a>
      );
    },
    sortable: false,
  },
  {
    name: <RenderNameDataTable name='TikTok' iconClassName='bx bxl-tiktok' />,
    cell: (item) => {
      const tk = parseTikTok(item.tiktok, item.tiktok_link);
      if (!tk) return '-';
      return (
        <a href={tk.href} target='_blank' rel='noreferrer'>
          {tk.label}
        </a>
      );
    },
    sortable: false,
  },
  {
    name: <RenderNameDataTable name='Comissão' iconClassName='bx bx-tag' />,
    cell: (item) =>
      item.subscription_fee ? (
        <div className='d-flex flex-column text-center'>
          <div>
            <b>{item.commission}%</b> (recorrência)
          </div>
          <div>
            <b>{item.subscription_fee_commission}%</b> (adesão)
          </div>
          <div>
            <b>Regra de comissão:</b>
            <br />
            {item.subscription_fee_only
              ? 'Apenas adesão'
              : 'Adesão + Recorrência'}
          </div>
        </div>
      ) : (
        <div className='text-center w-100'>{item.commission}%</div>
      ),
    sortable: true,
    center: true,
  },
  {
    name: <RenderNameDataTable name='Aceito em:' iconClassName='bx bx-flag' />,
    sortable: false,
    center: true,
    cell: (item) => formatDate(item?.date),
  },
  {
    name: <RenderNameDataTable name='Status' iconClassName='bx bx-flag' />,
    cell: (item) => (
      <BadgeDS variant={item.status.color} disc>
        {item.status.name}
      </BadgeDS>
    ),
    sortable: true,
    center: true,
  },
  {
    name: <RenderNameDataTable name='Ações' iconClassName='bx bxs-pencil' />,
    cell: (item) => renderActions(item),
    center: true,
    sortable: true,
  },
]);

export default function PageAffiliates() {
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalInfoShow, setModalInfoShow] = useState(false);
  const [modalPendingShow, setModalPendingShow] = useState(false);
  const [modalConfirmShow, setModalConfirmShow] = useState(false);
  const [modalRejectShow, setModalRejectShow] = useState(false);
  const [requesting, setRequesting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [classrooms] = useState([]);
  const [pending, setPending] = useState([]);
  const [pendingCount, setPendingCount] = useState(null);
  const [activeAffiliate, setActiveAffiliate] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterParams, setFilterParams] = useState(null);
  const [filterParamsRequests, setFilterParamsRequests] = useState(null);
  const [records, setRecords] = useState([]);
  const [modalExport, setModalExport] = useState(false);
  const [email, setEmail] = useState('');

  const history = useHistory();
  const { user } = useUser();

  const fetchData = () => {
    setRequesting(true);
    api
      .get(`/affiliates?size=${perPage}&page=${currentPage}`, {
        params: filterParams,
      })
      .then((response) => {
        setRequesting(false);
        setRecords(response.data.rows);
        setTotalRows(response.data.count);
      })
      .catch(() => {});
  };

  const exportAffiliates = () => {
    const params = { format: 'xlsx' };
    if (filterParams) {
      for (const [key, value] of filterParams.entries()) {
        params[key] = value;
      }
    }

    setLoading(true);
    api
      .post('/affiliates/exportAffiliatesEmail', { email, params })
      .then(() => {
        notify({
          message:
            'Requisição feita com sucesso. Seu arquivo ser­ processado e enviado em seu e-mail.',
          type: 'success',
        });
        setModalExport(false);
      })
      .catch(() => {
        notify({
          message: 'Erro ao exportar, tente novamente mais tarde.',
          type: 'error',
        });
      })
      .finally(() => setLoading(false));
  };

  const fetchPending = () => {
    api
      .get('/affiliates/pending', { params: filterParamsRequests })
      .then((response) => {
        setPending(response.data);
      })
      .catch(() => {});
  };

  const fetchPendingCount = () => {
    api
      .get('/affiliates/pending/count', { params: filterParamsRequests })
      .then((response) => {
        setPendingCount(response.data.count);
      })
      .catch(() => {});
  };

  const validatePhone = (number) => {
    if (!number) {
      return null;
    }

    const numberClean = String(number).replace(/\D/g, '');

    if (numberClean.length === 10) {
      return numberClean;
    }

    if (numberClean.length === 11 && numberClean[2] === '9') {
      return numberClean;
    }

    return null;
  };

  const openWhatsApp = (number) => {
    const numberValid = validatePhone(number);

    if (!numberValid) {
      notify({
        message: 'Número de WhatsApp inválido. Verifique e tente novamente',
        type: 'error',
      });
      return;
    }

    const url = `https://wa.me/+55${numberValid}`;
    window.open(url, '_blank');
  };

  const renderActions = (affiliate) => {
    return (
      <>
        <ButtonDS
          size={'icon'}
          variant='primary'
          className='mr-1'
          onClick={() => {
            setActiveAffiliate(affiliate);
            setModalEditShow(true);
          }}
        >
          <i className='bx bxs-pencil'></i>
        </ButtonDS>

        <ButtonDS
          size={'icon'}
          variant='light'
          className='mr-1'
          onClick={() => {
            setActiveAffiliate(affiliate);
            setModalInfoShow(true);
          }}
        >
          <i className='bx bxs-user'></i>
        </ButtonDS>
        
        <ButtonDS
          size={'icon'}
          variant='success'
          onClick={() => openWhatsApp(affiliate?.whatsapp || null)}
        >
          <i className='bx bxs-phone'></i>
        </ButtonDS>
      </>
    );
  };

  const pendingResponse = async (response, invite) => {
    setRequesting(true);

    api
      .put(`/affiliates/${response}/${invite.uuid}`)
      .then(() => {
        notify({ message: 'Salvo com sucesso', type: 'success' });
        setModalPendingShow(false);
        fetchData();
      })
      .catch(() => {
        notify({ message: 'Falha ao salvar', type: 'error' });
      })
      .finally(() => setRequesting(false));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  const acceptAll = async () => {
    let success = true;
    setRequesting(true);
    for await (const invite of pending) {
      try {
        await api.put(`/affiliates/active/${invite.uuid}`);
      } catch (error) {
        success = false;
        break;
      }
    }
    setRequesting(false);
    if (success) {
      notify({ message: 'Salvo com sucesso', type: 'success' });
      setModalPendingShow(false);
      fetchData();
    } else {
      notify({ message: 'Falha ao salvar', type: 'error' });
    }
  };

  const rejectAll = async () => {
    let success = true;
    setRequesting(true);

    for await (const invite of pending) {
      try {
        await api.put(`/affiliates/reject/${invite.uuid}`);
      } catch (error) {
        success = false;
        break;
      }
    }

    setRequesting(false);

    if (success) {
      notify({ message: 'Salvo com sucesso', type: 'success' });
      setModalPendingShow(false);
      fetchData();
    } else {
      notify({ message: 'Falha ao salvar', type: 'error' });
    }
  };

  useEffect(() => {
    if (!modalEditShow) {
      fetchData();
    }
  }, [filterParams, modalEditShow]);

  useEffect(() => {
    fetchPending();
    fetchPendingCount();
  }, [modalPendingShow, filterParamsRequests]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (filterParams) {
      fetchData();
    }
  }, [currentPage, perPage, filterParams]);

  return (
    <>
      {modalEditShow && (
        <ModalGeneric
          show={modalEditShow}
          setShow={setModalEditShow}
          title={'Ações de ' + activeAffiliate.user}
          centered
        >
          <Actions
            setShow={setModalEditShow}
            activeAffiliate={activeAffiliate}
            setActiveAffiliate={setActiveAffiliate}
            classrooms={classrooms}
          />
        </ModalGeneric>
      )}

      {modalInfoShow && (
        <ModalGeneric
          show={modalInfoShow}
          setShow={setModalInfoShow}
          title={'Informações do Afiliado'}
          centered
        >
          <AffiliateInfo activeAffiliate={activeAffiliate} />
        </ModalGeneric>
      )}

      {modalPendingShow && (
        <ModalGeneric
          show={modalPendingShow}
          setShow={setModalPendingShow}
          title={'Solicitações de afiliados pendentes'}
          centered
          size='xl'
        >
          <div>
            <FilterListing
              setFilterParams={setFilterParamsRequests}
              pageFilter={'affiliatesRequests'}
              placeHolder={'Digite o que deseja...'}
            />
          </div>
          <ConfirmAction
            title={'Aceitar todos afiliados'}
            show={modalConfirmShow}
            setShow={setModalConfirmShow}
            handleAction={acceptAll}
            buttonText={'Aceitar todos'}
            variant={'primary'}
            variantButton={'primary'}
            textAlert={'Você deseja aceitar todos os afiliados?'}
            simpleConfirm
            centered
            className='mt-2'
          />

          <ConfirmAction
            title={'Rejeitar todos afiliados'}
            show={modalRejectShow}
            setShow={setModalRejectShow}
            handleAction={rejectAll}
            buttonText={'Rejeitar todos'}
            variant={'danger'}
            variantButton={'danger'}
            textAlert={'Você deseja rejeitar todos os afiliados?'}
            simpleConfirm
            centered
            className='mt-2'
          />

          <Table responsive>
            <thead>
              <tr>
                <th>Produto</th>
                <th
                  style={{
                    minWidth: '160px',
                  }}
                >
                  Comissão
                </th>
                <th>Afiliado</th>
                <th>Requisitado em</th>
                <th
                  className='text-center'
                  style={{
                    minWidth: '160px',
                  }}
                >
                  Aceitar ou Rejeitar
                </th>
              </tr>
            </thead>

            <tbody>
              {pending.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.product.name}</td>
                    {item.subscription_fee ? (
                      <td>
                        <div>
                          <b>{item.commission}%</b> (recorrência)
                        </div>
                        <div>
                          <b>{item.subscription_fee_commission}%</b> (adesão)
                        </div>
                        <div>
                          <b>Regra de comissão:</b>{' '}
                          {item.subscription_fee_only
                            ? 'Apenas na adesão'
                            : 'Adesão + Recorrência'}
                        </div>
                      </td>
                    ) : (
                      <td>{item.commission}%</td>
                    )}
                    <td>
                      <div>{item.user}</div>
                      <div>{item.email}</div>
                    </td>
                    <td>{formatDate(item.date)}</td>
                    <td className='text-center'>
                      {!requesting ? (
                        <>
                          <div className='d-flex justify-content-center'>
                            <div className='mr-1'>
                              <ButtonDS
                                size={'icon'}
                                variant='success'
                                className='mr-4'
                                onClick={() => {
                                  pendingResponse('active', item);
                                }}
                              >
                                <i className='bx bxs-like'></i>
                              </ButtonDS>
                            </div>
                            <div>
                              <ButtonDS
                                size={'icon'}
                                variant='danger'
                                onClick={() => {
                                  pendingResponse('reject', item);
                                }}
                              >
                                <i className='bx bxs-dislike'></i>
                              </ButtonDS>
                            </div>
                          </div>
                        </>
                      ) : (
                        'aguarde...'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Row className='d-flex flex-column flex-md-row justify-content-end mr-0 mr-md-2 ml-2 ml-md-0 mt-2'>
            <ButtonDS
              className='mr-0 mr-md-2'
              onClick={() => setModalConfirmShow(true)}
              disabled={requesting}
              size='md'
            >
              {!requesting ? 'Aceitar todos' : 'Carregando...'}
            </ButtonDS>

            <ButtonDS
              variant='danger'
              className='mt-2 mt-md-0'
              onClick={() => setModalRejectShow(true)}
              disabled={requesting}
              size='md'
            >
              {!requesting ? 'Rejeitar todos' : 'Carregando...'}
            </ButtonDS>
          </Row>
        </ModalGeneric>
      )}

      <section id='pageAffiliates'>
        <div className='page-title-wrap'>
          <PageTitle title='Meus Afiliados' />
        </div>
        <div className='mb-4 d-flex flex-column flex-sm-row align-items-center justify-content-center'>
          <ButtonDS
            variant='primary'
            size='sm'
            onClick={(e) => {
              e.preventDefault();
              history.push('/afiliados/pendentes');
            }}
            disabled={pending.length === 0}
            iconLeft={'bx-envelope'}
            style={{
              width: 'max-content',
            }}
          >
            <div>Pedidos de afiliação</div>
            <span
              className='counter'
              style={{
                background: 'white',
                color: '#0f1b35',
                borderRadius: '20px',
                display: 'inline-block',
                marginLeft: '8px',
                fontSize: 12,
                padding: '2px 6px',
              }}
              disabled={pendingCount === 0}
              iconLeft={'bx-envelope'}
            >
              {pendingCount}
            </span>
          </ButtonDS>

          <ButtonDS
            className='ml-sm-auto mt-2 mt-sm-0'
            onClick={() => {
              setModalExport(true);
              setEmail(user?.email || '');
            }}
            variant={'success'}
            size='md'
            disabled={loading}
            iconLeft={'bxs-file-export'}
          >
            {!loading ? 'Exportar' : 'Exportando...'}
          </ButtonDS>
        </div>

        <div>
          <FilterListing
            setFilterParams={setFilterParams}
            pageFilter={'affiliates'}
            placeHolder={'Digite o que deseja...'}
          />
        </div>
        <Row>
          <Col>
            <div className='container-datatable card'>
              <DataTable
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página',
                  rangeSeparatorText: 'de',
                  selectAllRowsItem: true,
                  selectAllRowsItemText: 'Todos',
                }}
                columns={columns(renderActions)}
                data={records}
                striped
                highlightOnHover
                progressPending={requesting}
                progressComponent={<Loader title='Carregando afiliados...' />}
                noDataComponent={<NoDataComponentContent />}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
                responsive
              />
            </div>
          </Col>
        </Row>
      </section>
      <ModalExport
        show={modalExport}
        onHide={() => setModalExport(false)}
        onSubmit={exportAffiliates}
        user={user}
        email={email}
        setEmail={setEmail}
      />
    </>
  );
}
