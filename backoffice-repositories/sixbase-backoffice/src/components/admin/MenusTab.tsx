import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Tooltip,
} from 'reactstrap';
import { Plus, Edit, Trash2 } from 'react-feather';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import ConfirmAction from '../../views/components/ConfirmAction.jsx';
import DataTable from 'react-data-table-component';
import LoadingSpinner from '../LoadingSpinner';
import { useSkin } from '../../utility/hooks/useSkin';
import { MenuItem, Role } from 'interfaces/admin.interface';

interface MenuItemExtended extends MenuItem {
  created_at: string;
  roles?: Role[];
}

const tableRowStyles = {
  rows: {
    style: {
      fontSize: '1.05rem',
      fontWeight: 600,
    },
  },
};

const MenusTab: React.FC = () => {
  const { skin } = useSkin();
  const [menuItems, setMenuItems] = useState<MenuItemExtended[]>([]);
  const [loading, setLoading] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

  const [menuKey, setMenuKey] = useState('');
  const [menuRoute, setMenuRoute] = useState('');

  const [tooltipOpen, setTooltipOpen] = useState<{ [key: string]: boolean }>(
    {},
  );

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backoffice/menus');
      setMenuItems(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar itens de menu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = async () => {
    if (!menuKey || !menuRoute) {
      toast.error('Key e rota são obrigatórios');
      return;
    }

    const payload = {
      key: menuKey,
      route: menuRoute,
    };

    console.log('Enviando payload:', payload);
    console.log('menuKey:', menuKey);
    console.log('menuRoute:', menuRoute);

    try {
      await api.post('/backoffice/menus', payload);
      toast.success('Item de menu criado com sucesso');
      setCreateModal(false);
      setMenuKey('');
      setMenuRoute('');
      loadMenuItems();
    } catch (error) {
      console.error('Erro ao criar menu:', error);
      toast.error('Erro ao criar item de menu');
    }
  };

  const handleEditMenu = async () => {
    if (!selectedMenu || !menuKey || !menuRoute) return;

    try {
      await api.patch(`/backoffice/menus/${selectedMenu.id}`, {
        key: menuKey,
        route: menuRoute,
      });
      toast.success('Item de menu atualizado com sucesso');
      setEditModal(false);
      setMenuKey('');
      setMenuRoute('');
      setSelectedMenu(null);
      loadMenuItems();
    } catch (error) {
      toast.error('Erro ao atualizar item de menu');
    }
  };

  const handleDeleteMenu = async () => {
    if (!selectedMenu) return;

    try {
      await api.delete(`/backoffice/menus/${selectedMenu.id}`);
      toast.success('Item de menu removido com sucesso');
      setDeleteModal(false);
      setSelectedMenu(null);
      loadMenuItems();
    } catch (error) {
      toast.error('Erro ao remover item de menu');
    }
  };

  const openCreateModal = () => {
    setMenuKey('');
    setMenuRoute('');
    setCreateModal(true);
  };

  const openEditModal = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setMenuKey(menu.key);
    setMenuRoute(menu.route);
    setEditModal(true);
  };

  const openDeleteModal = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setDeleteModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const toggleTooltip = (tooltipId: string) => {
    setTooltipOpen((prev) => ({
      ...prev,
      [tooltipId]: !prev[tooltipId],
    }));
  };

  const columns = [
    {
      name: 'Key',
      cell: (row: MenuItem) => (
        <div className="text-capitalize">
          <strong>{row.key}</strong>
        </div>
      ),
      sortable: true,
      width: '25%',
    },
    {
      name: 'Rota',
      cell: (row: MenuItem) => <code className="text-info">{row.route}</code>,
      width: '25%',
    },
    {
      name: 'Roles',
      cell: (row: MenuItemExtended) => (
        <div className="d-flex flex-wrap gap-1">
          {row.roles?.map((role) => (
            <Badge key={role.id} color="light-success" pill>
              {role.name}
            </Badge>
          )) || <span className="text-muted">Nenhuma role</span>}
        </div>
      ),
      width: '30%',
    },
    {
      name: 'Criado em',
      cell: (row: MenuItemExtended) => (
        <small>{formatDate(row.created_at)}</small>
      ),
      sortable: true,
      width: '10%',
    },
    {
      name: 'Ações',
      center: true,
      cell: (row: MenuItem) => {
        const editTooltipId = `edit-tooltip-${row.id}`;
        const deleteTooltipId = `delete-tooltip-${row.id}`;

        return (
          <div className="d-flex gap-1">
            <div id={editTooltipId}>
              <Badge
                color="primary"
                size="sm"
                onClick={() => openEditModal(row)}
                style={{ cursor: 'pointer' }}
                className="d-flex align-items-center"
              >
                <Edit size={16} />
              </Badge>
            </div>
            <Tooltip
              placement="top"
              isOpen={tooltipOpen[editTooltipId] || false}
              target={editTooltipId}
              toggle={() => toggleTooltip(editTooltipId)}
            >
              Editar item de menu
            </Tooltip>

            <div id={deleteTooltipId}>
              <Badge
                color="danger"
                size="sm"
                onClick={() => openDeleteModal(row)}
                style={{ cursor: 'pointer' }}
                className="d-flex align-items-center"
              >
                <Trash2 size={16} />
              </Badge>
            </div>
            <Tooltip
              placement="top"
              isOpen={tooltipOpen[deleteTooltipId] || false}
              target={deleteTooltipId}
              toggle={() => toggleTooltip(deleteTooltipId)}
            >
              Excluir item de menu
            </Tooltip>
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '10%',
    },
  ];

  return (
    <div>
      {/* Tabela de menus */}
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Itens de Menu ({menuItems.length})</h5>
            <Button
              color="primary"
              className="d-flex align-items-center gap-2"
              onClick={openCreateModal}
            >
              <Plus size={16} />
              Novo Item
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={menuItems}
            progressPending={loading}
            customStyles={tableRowStyles}
            pagination
            paginationServer={false}
            paginationComponentOptions={{
              noRowsPerPage: true,
              rangeSeparatorText: 'de',
            }}
            progressComponent={<LoadingSpinner />}
            noDataComponent={
              <div className="text-center py-4">
                <p className="text-muted mb-0">
                  Nenhum item de menu encontrado
                </p>
              </div>
            }
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          />
        </CardBody>
      </Card>

      {/* Modal de criação */}
      <Modal isOpen={createModal} toggle={() => setCreateModal(false)}>
        <ModalHeader toggle={() => setCreateModal(false)}>
          Criar Novo Item de Menu
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="menuKey">Key</Label>
            <Input
              id="menuKey"
              type="text"
              value={menuKey}
              onChange={(e) => setMenuKey(e.target.value)}
              placeholder="Ex: new_feature"
            />
            <small className="text-muted">
              Identificador único para o item de menu
            </small>
          </FormGroup>
          <FormGroup>
            <Label for="menuRoute">Rota</Label>
            <Input
              id="menuRoute"
              type="text"
              value={menuRoute}
              onChange={(e) => setMenuRoute(e.target.value)}
              placeholder="Ex: /new-feature"
            />
            <small className="text-muted">Caminho da rota no frontend</small>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setCreateModal(false)}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleCreateMenu}>
            Criar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de edição */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)}>
        <ModalHeader toggle={() => setEditModal(false)}>
          Editar Item de Menu
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="editMenuKey">Key</Label>
            <Input
              id="editMenuKey"
              type="text"
              value={menuKey}
              onChange={(e) => setMenuKey(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="editMenuRoute">Rota</Label>
            <Input
              id="editMenuRoute"
              type="text"
              value={menuRoute}
              onChange={(e) => setMenuRoute(e.target.value)}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModal(false)}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleEditMenu}>
            Salvar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      {selectedMenu && (
        <ConfirmAction
          show={deleteModal}
          setShow={setDeleteModal}
          footer={false}
          centered
          simpleConfirm
          title="Confirmar exclusão"
          description={`Tem certeza que deseja excluir o item de menu "${selectedMenu.key}"? Esta ação não pode ser desfeita e pode afetar as permissões das roles.`}
          textAlert="Essa operação não poderá ser desfeita e pode afetar as permissões das roles."
          buttonText="Excluir"
          handleAction={async () => {
            await handleDeleteMenu();
            setDeleteModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MenusTab;
