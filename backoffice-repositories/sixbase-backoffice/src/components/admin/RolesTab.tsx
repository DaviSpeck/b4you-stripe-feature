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
import { Plus, Edit, Trash2, Settings, X } from 'react-feather';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import ConfirmAction from '../../views/components/ConfirmAction.jsx';
import DataTable from 'react-data-table-component';
import LoadingSpinner from '../LoadingSpinner';
import { useSkin } from '../../utility/hooks/useSkin';
import { MenuItem, Role } from 'interfaces/admin.interface';

const tableRowStyles = {
  rows: {
    style: {
      fontSize: '1.05rem',
      fontWeight: 600,
    },
  },
};

const RolesTab: React.FC = () => {
  const { skin } = useSkin();
  const [roles, setRoles] = useState<Role[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [menusModal, setMenusModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);

  const [tooltipOpen, setTooltipOpen] = useState<{ [key: string]: boolean }>(
    {},
  );

  useEffect(() => {
    loadRoles();
    loadMenuItems();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backoffice/roles');
      setRoles(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar roles');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const response = await api.get('/backoffice/menus');
      setMenuItems(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar itens de menu');
    }
  };

  const handleCreateRole = async () => {
    if (!roleName || !roleDescription) {
      toast.error('Nome e descrição são obrigatórios');
      return;
    }

    try {
      await api.post('/backoffice/roles', {
        name: roleName,
        description: roleDescription,
      });
      toast.success('Role criada com sucesso');
      setCreateModal(false);
      setRoleName('');
      setRoleDescription('');
      loadRoles();
    } catch (error) {
      toast.error('Erro ao criar role');
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole || !roleName || !roleDescription) return;

    try {
      await api.patch(`/backoffice/roles/${selectedRole.id}`, {
        name: roleName,
        description: roleDescription,
      });
      toast.success('Role atualizada com sucesso');
      setEditModal(false);
      setRoleName('');
      setRoleDescription('');
      setSelectedRole(null);
      loadRoles();
    } catch (error) {
      toast.error('Erro ao atualizar role');
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await api.delete(`/backoffice/roles/${selectedRole.id}`);
      toast.success('Role removida com sucesso');
      setDeleteModal(false);
      setSelectedRole(null);
      loadRoles();
    } catch (error) {
      toast.error('Erro ao remover role');
    }
  };

  const handleUpdateRoleMenus = async () => {
    if (!selectedRole) return;

    try {
      await api.patch(`/backoffice/roles/${selectedRole.id}/menus`, {
        menu_ids: selectedMenuIds,
      });
      toast.success('Menus da role atualizados com sucesso');
      setMenusModal(false);
      setSelectedMenuIds([]);
      setSelectedRole(null);
      loadRoles();
    } catch (error) {
      toast.error('Erro ao atualizar menus da role');
    }
  };

  const openCreateModal = () => {
    setRoleName('');
    setRoleDescription('');
    setCreateModal(true);
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setEditModal(true);
  };

  const openMenusModal = (role: Role) => {
    setSelectedRole(role);
    setSelectedMenuIds(role.menuItems?.map((item) => item.id) || []);
    setMenusModal(true);
  };

  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setDeleteModal(true);
  };

  const toggleMenuSelection = (menuId: number) => {
    setSelectedMenuIds((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
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
      name: 'Nome',
      cell: (row: Role) => (
        <div className="text-capitalize">
          <strong>{row.name}</strong>
        </div>
      ),
      sortable: true,
      width: '20%',
    },
    {
      name: 'Descrição',
      cell: (row: Role) => <span>{row.description}</span>,
      width: '30%',
    },
    {
      name: 'Menus',
      cell: (row: Role) => (
        <div className="d-flex flex-wrap gap-1">
          {row.menuItems?.map((menu) => (
            <Badge key={menu.id} color="light-info" pill>
              {menu.key}
            </Badge>
          )) || <span className="text-muted">Nenhum menu</span>}
        </div>
      ),
      width: '25%',
    },
    {
      name: 'Criado em',
      cell: (row: Role) => <small>{formatDate(row.created_at)}</small>,
      sortable: true,
      width: '15%',
    },
    {
      name: 'Ações',
      center: true,
      cell: (row: Role) => {
        const editTooltipId = `edit-tooltip-${row.id}`;
        const menusTooltipId = `menus-tooltip-${row.id}`;
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
              Editar role
            </Tooltip>

            <div id={menusTooltipId}>
              <Badge
                color="info"
                size="sm"
                onClick={() => openMenusModal(row)}
                style={{ cursor: 'pointer' }}
                className="d-flex align-items-center"
              >
                <Settings size={16} />
              </Badge>
            </div>
            <Tooltip
              placement="top"
              isOpen={tooltipOpen[menusTooltipId] || false}
              target={menusTooltipId}
              toggle={() => toggleTooltip(menusTooltipId)}
            >
              Gerenciar menus
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
              Excluir role
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
      {/* Tabela de roles */}
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Roles ({roles.length})</h5>
            <Button
              color="primary"
              className="d-flex align-items-center gap-2"
              onClick={openCreateModal}
            >
              <Plus size={16} />
              Nova Role
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={roles}
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
                <p className="text-muted mb-0">Nenhuma role encontrada</p>
              </div>
            }
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          />
        </CardBody>
      </Card>

      {/* Modal de criação */}
      <Modal isOpen={createModal} toggle={() => setCreateModal(false)}>
        <ModalHeader toggle={() => setCreateModal(false)}>
          Criar Nova Role
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="roleName">Nome</Label>
            <Input
              id="roleName"
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Ex: MODERATOR"
            />
          </FormGroup>
          <FormGroup>
            <Label for="roleDescription">Descrição</Label>
            <Input
              id="roleDescription"
              type="text"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Ex: Moderador do sistema"
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setCreateModal(false)}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleCreateRole}>
            Criar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de edição */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)}>
        <ModalHeader toggle={() => setEditModal(false)}>
          Editar Role
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="editRoleName">Nome</Label>
            <Input
              id="editRoleName"
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="editRoleDescription">Descrição</Label>
            <Input
              id="editRoleDescription"
              type="text"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModal(false)}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleEditRole}>
            Salvar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de gerenciamento de menus */}
      <Modal isOpen={menusModal} toggle={() => setMenusModal(false)} size="lg">
        <ModalHeader toggle={() => setMenusModal(false)}>
          Gerenciar Menus - {selectedRole?.name}
        </ModalHeader>
        <ModalBody>
          <p>Selecione os menus que esta role pode acessar:</p>
          <div className="row">
            {menuItems.map((menu) => (
              <div key={menu.id} className="col-md-6 mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`menu-${menu.id}`}
                    checked={selectedMenuIds.includes(menu.id)}
                    onChange={() => toggleMenuSelection(menu.id)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`menu-${menu.id}`}
                  >
                    <strong>{menu.key}</strong>
                    <br />
                    <small className="text-muted">{menu.route}</small>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setMenusModal(false)}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleUpdateRoleMenus}>
            Salvar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      {selectedRole && (
        <ConfirmAction
          show={deleteModal}
          setShow={setDeleteModal}
          footer={false}
          centered
          simpleConfirm
          title="Confirmar exclusão"
          description={`Tem certeza que deseja excluir a role "${selectedRole.name}"? Esta ação não pode ser desfeita.`}
          textAlert="Essa operação não poderá ser desfeita."
          buttonText="Excluir"
          handleAction={async () => {
            await handleDeleteRole();
            setDeleteModal(false);
          }}
        />
      )}
    </div>
  );
};

export default RolesTab;
