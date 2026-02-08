import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Input,
  Label,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Tooltip,
} from 'reactstrap';
import { UserPlus, UserMinus, Settings, Plus } from 'react-feather';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import useDebounce from '../../hooks/useDebounce';
import DataTable from 'react-data-table-component';
import LoadingSpinner from '../LoadingSpinner';
import { useSkin } from '../../utility/hooks/useSkin';
import ConfirmAction from '../../views/components/ConfirmAction.jsx';
import { UserContext } from '../../utility/context/UserContext';
import InputPasswordToggle from '../../@core/components/input-password-toggle';
import { Role, User } from 'interfaces/admin.interface';

const tableRowStyles = {
  rows: {
    style: {
      fontSize: '1.05rem',
      fontWeight: 600,
    },
  },
};

const UsersTab: React.FC = () => {
  const { skin } = useSkin();
  const { userData } = useContext(UserContext);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    id_role: '',
    is_admin: false,
  });

  const [defaultPassword, setDefaultPassword] = useState('');

  const [creatingUser, setCreatingUser] = useState(false);

  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);

  const [tooltipOpen, setTooltipOpen] = useState<{ [key: string]: boolean }>(
    {},
  );

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadDefaultPassword();
  }, [
    currentPage,
    debouncedSearchTerm,
    selectedRole,
    activeFilter,
    itemsPerPage,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setItemsPerPage(newPerPage);
    setCurrentPage(1);
  };

  const columns = [
    {
      name: 'Nome',
      cell: (row: User) => (
        <div className="text-capitalize">
          <strong>{row.full_name}</strong>
        </div>
      ),
      sortable: true,
      width: '20%',
    },
    {
      name: 'Email',
      cell: (row: User) => (
        <a
          href={`mailto:${row.email}`}
          className="text-info text-decoration-none"
          style={{ cursor: 'pointer' }}
        >
          <small>{row.email}</small>
        </a>
      ),
      width: '20%',
    },
    {
      name: 'Telefone',
      cell: (row: User) => (
        <a
          href={`tel:${row.phone}`}
          className="text-success text-decoration-none"
          style={{ cursor: 'pointer' }}
        >
          <small>{row.phone}</small>
        </a>
      ),
      width: '15%',
    },
    {
      name: 'Role',
      cell: (row: User) => (
        <Badge color="light-primary" pill>
          {row.role?.name || 'Sem role'}
        </Badge>
      ),
      width: '12%',
    },
    {
      name: 'Status',
      cell: (row: User) => (
        <Badge color={row.active ? 'success' : 'danger'} pill>
          {row.active ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
      width: '8%',
    },
    {
      name: 'Criado em',
      cell: (row: User) => <small>{formatDate(row.created_at)}</small>,
      sortable: true,
      width: '12%',
    },
    {
      name: 'Ações',
      center: true,
      cell: (row: User) => {
        const editTooltipId = `edit-tooltip-${row.id}`;
        const statusTooltipId = `status-tooltip-${row.id}`;
        const isOwnUser = isCurrentUser(row.id);

        return (
          <div className="d-flex gap-1">
            <div id={editTooltipId}>
              <Badge
                color="primary"
                size="sm"
                onClick={() => !isOwnUser && handleEditUser(row)}
                style={{
                  cursor: isOwnUser ? 'not-allowed' : 'pointer',
                  opacity: isOwnUser ? 0.5 : 1,
                }}
                className="d-flex align-items-center"
              >
                <Settings size={16} />
              </Badge>
            </div>
            <Tooltip
              placement="top"
              isOpen={tooltipOpen[editTooltipId] || false}
              target={editTooltipId}
              toggle={() => toggleTooltip(editTooltipId)}
            >
              {isOwnUser
                ? 'Você não pode editar sua própria role'
                : 'Editar role do usuário'}
            </Tooltip>

            <div id={statusTooltipId}>
              <Badge
                color={row.active ? 'danger' : 'success'}
                size="sm"
                onClick={() => !isOwnUser && handleToggleUserStatus(row)}
                style={{
                  cursor: isOwnUser ? 'not-allowed' : 'pointer',
                  opacity: isOwnUser ? 0.5 : 1,
                }}
                className="d-flex align-items-center"
              >
                {row.active ? <UserMinus size={16} /> : <UserPlus size={16} />}
              </Badge>
            </div>
            <Tooltip
              placement="top"
              isOpen={tooltipOpen[statusTooltipId] || false}
              target={statusTooltipId}
              toggle={() => toggleTooltip(statusTooltipId)}
            >
              {isOwnUser
                ? 'Você não pode desativar a si mesmo'
                : row.active
                ? 'Desativar usuário'
                : 'Ativar usuário'}
            </Tooltip>
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '13%',
    },
  ];

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (selectedRole) params.append('role_id', selectedRole);
      if (activeFilter !== '') params.append('active', activeFilter);

      const response = await api.get(`/backoffice/users?${params}`);
      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotalItems(response.data.data.pagination.totalItems);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/backoffice/roles');
      setRoles(response.data.data);
    } catch (error) {
      toast.error('Erro ao carregar roles');
    }
  };

  const loadDefaultPassword = async () => {
    try {
      const response = await api.get('/backoffice/users/default-password');
      setDefaultPassword(response.data.data.default_password);
    } catch (error) {
      console.error('Erro ao carregar senha padrão:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleId(user.id_role);
    setEditModal(true);
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser || !selectedRoleId) return;

    try {
      await api.patch(`/backoffice/users/${selectedUser.id}/role`, {
        role_id: selectedRoleId,
      });
      toast.success('Role atualizada com sucesso');
      setEditModal(false);
      loadUsers();
    } catch (error) {
      toast.error('Erro ao atualizar role');
    }
  };

  const handleCreateUser = async () => {
    if (
      !newUser.full_name ||
      !newUser.email ||
      !newUser.phone ||
      !newUser.password ||
      !newUser.id_role
    ) {
      toast.error('Preencha todos os campos obrigatórios, incluindo a role');
      return;
    }

    setCreatingUser(true);
    try {
      const payload = {
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        id_role: Number(newUser.id_role),
        is_admin: newUser.is_admin,
      };

      await api.post('/backoffice/users', payload);
      toast.success('Usuário criado com sucesso');
      setCreateModal(false);
      resetCreateForm();
      loadUsers();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar usuário';
      toast.error(message);
    } finally {
      setCreatingUser(false);
    }
  };

  const resetCreateForm = () => {
    setNewUser({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      id_role: '',
      is_admin: false,
    });
    setCreatingUser(false);
  };

  const generateDefaultPassword = () => {
    if (defaultPassword) {
      setNewUser((prev) => ({ ...prev, password: defaultPassword }));
    } else {
      toast.error('Senha padrão não disponível');
    }
  };

  const handleToggleUserStatus = (user: User) => {
    setUserToToggle(user);
    setShowStatusConfirm(true);
  };

  const confirmToggleUserStatus = async () => {
    if (!userToToggle) return;

    try {
      await api.patch(`/backoffice/users/${userToToggle.id}/status`, {
        active: !userToToggle.active,
      });
      toast.success(
        `Usuário ${
          !userToToggle.active ? 'ativado' : 'desativado'
        } com sucesso`,
      );
      loadUsers();
      setShowStatusConfirm(false);
      setUserToToggle(null);
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
      setShowStatusConfirm(false);
      setUserToToggle(null);
    }
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

  const isCurrentUser = (userId: number) => {
    return userData?.id === userId;
  };

  return (
    <div>
      {/* Filtros */}
      <Card>
        <CardBody>
          <Row>
            <Col md="6">
              <Label for="search">Buscar</Label>
              <Input
                id="search"
                type="text"
                placeholder="Nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md="3">
              <Label for="roleFilter">Role</Label>
              <Input
                id="roleFilter"
                type="select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Todas as roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md="3">
              <Label for="activeFilter">Status</Label>
              <Input
                id="activeFilter"
                type="select"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Tabela de usuários */}
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Usuários ({totalItems})</h5>
            <Button
              color="primary"
              onClick={() => {
                resetCreateForm();
                setCreateModal(true);
              }}
              className="d-flex align-items-center"
            >
              <Plus size={16} className="me-1" />
              Novo Usuário
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={users}
            progressPending={loading}
            customStyles={tableRowStyles}
            pagination
            paginationServer
            paginationTotalRows={totalItems}
            paginationDefaultPage={currentPage}
            paginationPerPage={itemsPerPage}
            onChangeRowsPerPage={handlePerRowsChange}
            onChangePage={handlePageChange}
            paginationComponentOptions={{
              noRowsPerPage: true,
              rangeSeparatorText: 'de',
            }}
            progressComponent={<LoadingSpinner />}
            noDataComponent={
              <div className="text-center py-4">
                <p className="text-muted mb-0">Nenhum usuário encontrado</p>
              </div>
            }
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          />
        </CardBody>
      </Card>

      {/* Modal de edição */}
      <Modal
        isOpen={editModal}
        toggle={() => setEditModal(false)}
        size="lg"
        style={{ maxWidth: '600px' }}
      >
        <ModalHeader toggle={() => setEditModal(false)}>
          Editar Role do Usuário
        </ModalHeader>
        <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedUser && (
            <div>
              <p>
                <strong>Usuário:</strong> {selectedUser.full_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
              <FormGroup>
                <Label for="roleSelect">Role</Label>
                <Input
                  id="roleSelect"
                  type="select"
                  value={selectedRoleId || ''}
                  onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                >
                  <option value="">Selecione uma role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModal(false)}>
            Cancelar
          </Button>
          <Button color="primary" onClick={handleUpdateUserRole}>
            Salvar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de criação de usuário */}
      <Modal
        isOpen={createModal}
        toggle={() => {
          setCreateModal(false);
          resetCreateForm();
        }}
        size="lg"
        style={{ maxWidth: '600px' }}
      >
        <ModalHeader
          toggle={() => {
            setCreateModal(false);
            resetCreateForm();
          }}
        >
          Criar Novo Usuário
        </ModalHeader>
        <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <form autoComplete="off">
            {/* Nome Completo */}
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                    placeholder="Digite o nome completo"
                    autoComplete="off"
                    name="full_name"
                    disabled={creatingUser}
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Telefone com botão ao lado */}
            <Row>
              <Col md="8">
                <FormGroup>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="11 99999-9999"
                    autoComplete="tel"
                    inputMode="tel"
                    name="phone"
                    disabled={creatingUser}
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label>&nbsp;</Label>
                  <div id="phone-default-tooltip">
                    <Button
                      color="secondary"
                      outline
                      block
                      onClick={() =>
                        setNewUser((prev) => ({
                          ...prev,
                          phone: '11 99999-9999',
                        }))
                      }
                      disabled={creatingUser}
                    >
                      Telefone Padrão
                    </Button>
                  </div>
                  <Tooltip
                    placement="top"
                    isOpen={tooltipOpen['phone-default-tooltip'] || false}
                    target="phone-default-tooltip"
                    toggle={() => toggleTooltip('phone-default-tooltip')}
                  >
                    Telefone padrão: 11 99999-9999
                  </Tooltip>
                </FormGroup>
              </Col>
            </Row>

            {/* Email */}
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Digite o email"
                    autoComplete="off"
                    name="email"
                    disabled={creatingUser}
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Senha com botão ao lado */}
            <Row>
              <Col md="8">
                <FormGroup>
                  <Label htmlFor="password">Senha *</Label>
                  <InputPasswordToggle
                    {...({
                      value: newUser.password,
                      onChange: (e: any) =>
                        setNewUser((prev) => ({
                          ...prev,
                          password: e.target.value,
                        })),
                      placeholder: 'Digite a senha',
                      autoComplete: 'new-password',
                      name: 'newPassword',
                      disabled: creatingUser,
                      className: 'input-group-merge',
                    } as any)}
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label>&nbsp;</Label>
                  <div id="password-default-tooltip">
                    <Button
                      color="secondary"
                      outline
                      block
                      onClick={generateDefaultPassword}
                      disabled={creatingUser}
                    >
                      Senha Padrão
                    </Button>
                  </div>
                  <Tooltip
                    placement="top"
                    isOpen={tooltipOpen['password-default-tooltip'] || false}
                    target="password-default-tooltip"
                    toggle={() => toggleTooltip('password-default-tooltip')}
                  >
                    Senha padrão: {defaultPassword}
                  </Tooltip>
                </FormGroup>
              </Col>
            </Row>

            {/* Role */}
            <Row>
              <Col md="12">
                <FormGroup>
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    type="select"
                    value={newUser.id_role}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        id_role: e.target.value,
                      }))
                    }
                    disabled={creatingUser}
                  >
                    <option value="">Selecione uma role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => {
              setCreateModal(false);
              resetCreateForm();
            }}
            disabled={creatingUser}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            onClick={handleCreateUser}
            disabled={creatingUser}
          >
            {creatingUser ? 'Criando...' : 'Criar Usuário'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de confirmação para alterar status */}
      {userToToggle && (
        <ConfirmAction
          show={showStatusConfirm}
          setShow={setShowStatusConfirm}
          footer={false}
          centered
          simpleConfirm
          title={userToToggle.active ? 'Desativar Usuário' : 'Ativar Usuário'}
          description={`Tem certeza que deseja ${
            userToToggle.active ? 'desativar' : 'ativar'
          } o usuário "${userToToggle.full_name}"?`}
          textAlert={
            userToToggle.active
              ? 'O usuário não poderá mais acessar o sistema.'
              : 'O usuário poderá acessar o sistema novamente.'
          }
          buttonText={userToToggle.active ? 'Desativar' : 'Ativar'}
          variant={userToToggle.active ? 'warning' : 'success'}
          variantButton={userToToggle.active ? 'warning' : 'success'}
          handleAction={confirmToggleUserStatus}
        />
      )}
    </div>
  );
};

export default UsersTab;
