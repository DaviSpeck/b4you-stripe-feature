import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Input,
  Label,
  FormGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Spinner,
} from 'reactstrap';
import { api } from '@services/api';
import { toast } from 'react-toastify';
const configNotify = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const getTypeBlock = (value) => {
    const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cpfRegex.test(value)) return 'cpf';
    if (emailRegex.test(value)) return 'email';
    return null;
  };

  const handleSearch = async () => {
    const typeBlock = getTypeBlock(input);
    if (!typeBlock) {
      toast.error('Digite um CPF ou E-mail válido.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(
        `/blacklist/blocks?input=${input}&typeBlock=${typeBlock}`,
      );
      if (data.length === 0) {
        toast.error('Nenhum bloqueio encontrado.');
      } else {
        setBlocks(data);
        setModalOpen(true);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao buscar bloqueios.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAll = async () => {
    setRemoving(true);
    try {
      const ids = blocks.map((b) => b.id);
      await api.delete('/blacklist/blocks', { data: { ids } });
      toast.success('Bloqueios removidos com sucesso!');
      setModalOpen(false);
      setBlocks([]);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover bloqueios.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section id="sectionKYC">
      <h2 className="mb-2">Bloqueios - Consulta de bloqueios ativos</h2>
      <Card>
        <CardBody className="filters">
          <FormGroup className="filters">
            <Label>BUSCAR POR: E-MAIL OU CPF DA COMPRA</Label>
            <div className="d-flex">
              <Input
                onChange={({ target }) => setInput(target.value)}
                value={input}
              />
              <div className="flex justify-end ml-2">
                <Button
                  color="primary"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : 'Buscar'}
                </Button>
              </div>
            </div>
          </FormGroup>
        </CardBody>
      </Card>

      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        size="lg"
        centered
      >
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          Bloqueios Encontrados
        </ModalHeader>
        <ModalBody>
          <Table bordered>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block) => (
                <tr key={block.id}>
                  <td>{block.id}</td>
                  <td>{block.blockType}</td>
                  <td>{new Date(block.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleRemoveAll} disabled={removing}>
            {removing ? 'Removendo...' : 'Remover todos os bloqueios'}
          </Button>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </section>
  );
}
