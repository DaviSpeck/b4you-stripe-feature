import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from 'reactstrap';
import memoizeOne from 'memoize-one';
import {
  AlertTriangle,
  ThumbsDown,
  ThumbsUp,
  Info,
  RotateCcw,
  RotateCw,
} from 'react-feather';
import { formatDocument } from '@utils';
import { api } from '@services/api';
import Action from './Action';

import moment from 'moment';
import { Link } from 'react-router-dom';
import AvatarImg from '../../assets/images/avatars/avatar-blank.png';
import { useSkin } from '../../utility/hooks/useSkin';

const columns = memoizeOne((toggleAction, showDocuments) => [
  {
    name: 'Nome',
    minWidth: '300px',
    cell: (row) => (
      <div>
        <img
          className="mr-3"
          src={row.user.profile_picture ? row.user.profile_picture : AvatarImg}
          alt="Avatar"
          style={{ borderRadius: '50%' }}
          height={38}
          width={38}
        />
        <Link to={`/producer/${row.user.uuid}`}>{row?.user.full_name}</Link>
      </div>
    ),
  },
  {
    name: 'E-mail',
    cell: (row) => row.user.email,
  },
  {
    name: 'Documento',
    cell: (row) => {
      return row.user.cnpj
        ? formatDocument(row.user.cnpj, 'CNPJ')
        : formatDocument(row.user.document_number);
    },
  },
  {
    name: 'Telefone',
    cell: (row) => row.user.whatsapp,
  },
  {
    name: 'Data Solicitação',
    cell: (row) =>
      moment(row.updated_at ? row.updated_at : row.created_at).format(
        'DD/MM/YYYY HH:mm',
      ),
  },
  {
    name: 'Arquivos',
    width: '200px',
    cell: (row) => {
      return (
        <Button size="sm" color="light" onClick={() => showDocuments(row)}>
          <Info color="#4DD0BB" size="14"></Info>
          Visualizar
        </Button>
      );
    },
  },
  {
    name: 'Ações',
    center: true,
    cell: (row) => {
      return (
        <div className="w-100 d-flex justify-content-around">
          <Button
            size="sm"
            color="light"
            onClick={() => toggleAction('approve', row.uuid, 'cpf')}
          >
            <ThumbsUp color="green" size="14"></ThumbsUp>
          </Button>
          <Button
            size="sm"
            color="light"
            onClick={() => toggleAction('reprove', row.uuid, 'cpf')}
          >
            <ThumbsDown color="red" size="14"></ThumbsDown>
          </Button>
          <Button
            size="sm"
            color="light"
            onClick={() => toggleAction('info', row.user.id)}
          >
            <Info color="#4DD0BB" size="14"></Info>
          </Button>
        </div>
      );
    },
  },
]);

const columnsCNPJ = memoizeOne((toggleAction) => [
  {
    name: 'Nome',
    minWidth: '200px',
    cell: (row) => (
      <div>
        <img
          className="mr-3"
          src={row.profile_picture ? row.profile_picture : AvatarImg}
          alt="Avatar"
          style={{ borderRadius: '50%' }}
          height={38}
          width={38}
        />
        <Link to={`/producer/${row.uuid}`}>{row?.full_name}</Link>
      </div>
    ),
  },
  {
    name: 'E-mail',
    cell: (row) => row.email,
  },
  {
    name: 'CPF',
    cell: (row) => formatDocument(row.document_number, 'CPF'),
  },
  {
    name: 'CNPJ',
    cell: (row) => formatDocument(row.cnpj, 'CNPJ'),
  },
  {
    name: 'Requisitado em',
    cell: (row) =>
      row.cnpj_requested_at
        ? moment(row.cnpj_requested_at).format('DD/MM/YYYY HH:mm:ss')
        : ' - ',
  },
  {
    name: 'Ações',
    center: true,
    width: '180px',
    cell: (row) => {
      return (
        <div className="w-100 d-flex justify-content-around">
          <Button
            size="sm"
            color="light"
            onClick={() => toggleAction('approve', row.uuid, 'cnpj')}
          >
            <ThumbsUp color="green" size="14"></ThumbsUp>
          </Button>
          <Button
            size="sm"
            color="light"
            onClick={() => toggleAction('reprove', row.uuid, 'cnpj')}
          >
            <ThumbsDown color="red" size="14"></ThumbsDown>
          </Button>
        </div>
      );
    },
  },
]);

const noDataComponent = () => (
  <div className="d-flex align-items-end">
    <div className="me-1">
      <AlertTriangle size={24} />
    </div>
    <div>Nenhum documento para aprovação no momento!</div>
  </div>
);

function ImageVisualizer({ image, index }) {
  const [, setDeg] = useState(0);

  return (
    <>
      <div className="d-flex justify-content-between">
        <Button
          onClick={() => {
            const div = document.getElementById(`image-${index}`);
            setDeg((prev) => {
              const newDeg = prev - 90;
              div.style.mozTransform = 'rotate(' + newDeg + 'deg)';
              div.style.msTransform = 'rotate(' + newDeg + 'deg)';
              div.style.oTransform = 'rotate(' + newDeg + 'deg)';
              div.style.transform = 'rotate(' + newDeg + 'deg)';
              return newDeg;
            });
          }}
        >
          <RotateCcw />
        </Button>
        <Button
          onClick={() => {
            const div = document.getElementById(`image-${index}`);
            setDeg((prev) => {
              const newDeg = prev + 90;
              div.style.mozTransform = 'rotate(' + newDeg + 'deg)';
              div.style.msTransform = 'rotate(' + newDeg + 'deg)';
              div.style.oTransform = 'rotate(' + newDeg + 'deg)';
              div.style.transform = 'rotate(' + newDeg + 'deg)';
              return newDeg;
            });
          }}
        >
          <RotateCw />
        </Button>
      </div>
      <img src={image} alt="Documento" width={200} id={`image-${index}`} />
    </>
  );
}

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataCNPJ, setDataCNPJ] = useState([]);
  const [showAction, setShowAction] = useState(false);
  const [action, setAction] = useState('');
  const [identity, setIdentity] = useState(null);
  const [type, setType] = useState('cpf');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 100,
    totalRecords: 0,
  });
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { skin } = useSkin();

  const showDocuments = async ({
    doc_front_key,
    doc_back_key,
    address_key,
    selfie_key,
    user,
  }) => {
    const docs = [doc_back_key, doc_front_key, address_key, selfie_key];
    const promises = [];
    for (const doc of docs) {
      promises.push(api.get(`/kyc/file/${doc}`));
    }
    const responses = await Promise.all(promises);
    const links = [];
    for (const response of responses) {
      links.push(response.data.url);
    }
    setCurrentUser(user);
    setImages(links);
    setShowModal(true);
  };

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const responseCNPJ = await api.get('/kyc/cnpj');
      setDataCNPJ(responseCNPJ.data);
    } catch (error) {
      console.log('error aqui');
    }
    setLoading(false);
  };

  const fetchKYC = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/kyc?page=${pagination.page}&size=${pagination.size}`,
      );
      setData(response.data.rows);
      setPagination((prev) => ({ ...prev, totalRecords: response.data.count }));
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const toggleAction = (
    action = '',
    identity = '',
    type = '',
    reload = false,
  ) => {
    if (action) setAction(action);
    if (identity) setIdentity(identity);
    if (reload) fetchVerifications();
    if (type) setType(type);
    setShowAction((prev) => !prev);
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  useEffect(() => {
    fetchKYC();
  }, [pagination.page, pagination.size]);

  return (
    <section id="sectionKYC">
      <h2 className="mb-2">KYC</h2>

      <Action
        show={showAction}
        toggle={toggleAction}
        action={action}
        identity={identity}
        type={type}
      />
      <Modal
        id="modalViewDocuments"
        isOpen={showModal}
        toggle={() => setShowModal(false)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => setShowModal(false)}>
          Documentos de {currentUser ? currentUser.full_name : ' - '}
        </ModalHeader>
        <ModalBody>
          <div className="d-grid gap-3">
            {images.map((image, index) => (
              <Row>
                <ImageVisualizer image={image} index={index} />
              </Row>
            ))}
          </div>
        </ModalBody>
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Documentos para aprovação</CardTitle>
        </CardHeader>
        <CardBody>
          <DataTable
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página',
              rangeSeparatorText: 'de',
              selectAllRowsItem: false,
              selectAllRowsItemText: 'Todos',
            }}
            columns={columns(toggleAction, showDocuments)}
            data={data}
            noDataComponent={noDataComponent()}
            progressPending={loading}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
            pagination
            paginationServer
            paginationPerPage={pagination.size}
            paginationRowsPerPageOptions={[100, 50, 25, 10]}
            onChangeRowsPerPage={(perPage) =>
              setPagination((prev) => ({ ...prev, size: perPage }))
            }
            onChangePage={(newPage) =>
              setPagination((prev) => ({ ...prev, page: newPage - 1 }))
            }
            paginationTotalRows={pagination.totalRecords}
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>CNPJ's para aprovação</CardTitle>
        </CardHeader>
        <CardBody>
          <DataTable
            columns={columnsCNPJ(toggleAction)}
            data={dataCNPJ}
            noDataComponent={noDataComponent()}
            progressPending={loading}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          />
        </CardBody>
      </Card>
    </section>
  );
}
