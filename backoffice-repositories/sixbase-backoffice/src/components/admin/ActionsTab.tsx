import { useEffect, useState } from 'react';
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
    Tooltip
} from 'reactstrap';
import { Plus, Edit, Trash2, Users } from 'react-feather';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import ConfirmAction from '../../views/components/ConfirmAction.jsx';
import DataTable from 'react-data-table-component';
import LoadingSpinner from '../LoadingSpinner';
import { useSkin } from '../../utility/hooks/useSkin';

const tableRowStyles = {
    rows: {
        style: {
            fontSize: '1.05rem',
            fontWeight: 600
        }
    }
};

const ActionsTab = () => {
    const { skin } = useSkin();
    const [actions, setActions] = useState([]);
    const [menus, setMenus] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [rolesModal, setRolesModal] = useState(false);

    const [selectedAction, setSelectedAction] = useState(null);

    const [menuId, setMenuId] = useState('');
    const [key, setKey] = useState('');
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');

    const [tooltipOpen, setTooltipOpen] = useState({});

    useEffect(() => {
        loadActions();
        loadMenus();
        loadRoles();
    }, []);

    const loadActions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/backoffice/actions');
            setActions(response.data.data || []);
        } catch (error) {
            toast.error('Erro ao carregar ações');
        } finally {
            setLoading(false);
        }
    };

    const loadMenus = async () => {
        try {
            const response = await api.get('/backoffice/menus');
            setMenus(response.data.data || []);
        } catch {
            toast.error('Erro ao carregar menus');
        }
    };

    const loadRoles = async () => {
        try {
            const response = await api.get('/backoffice/roles');
            setRoles(response.data.data || []);
        } catch {
            toast.error('Erro ao carregar roles');
        }
    };

    const handleCreateAction = async () => {
        if (!menuId || !key || !label) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        try {
            await api.post('/backoffice/actions', {
                menu_item_id: Number(menuId),
                key,
                label,
                description
            });
            toast.success('Ação criada com sucesso');
            setCreateModal(false);
            resetForm();
            loadActions();
        } catch {
            toast.error('Erro ao criar ação');
        }
    };

    const handleEditAction = async () => {
        if (!selectedAction || !menuId || !key || !label) return;

        try {
            await api.patch(`/backoffice/actions/${selectedAction.id}`, {
                menu_item_id: Number(menuId),
                key,
                label,
                description
            });
            toast.success('Ação atualizada com sucesso');
            setEditModal(false);
            resetForm();
            setSelectedAction(null);
            loadActions();
        } catch {
            toast.error('Erro ao atualizar ação');
        }
    };

    const handleDeleteAction = async () => {
        if (!selectedAction) return;
        try {
            await api.delete(`/backoffice/actions/${selectedAction.id}`);
            toast.success('Ação excluída com sucesso');
            setDeleteModal(false);
            setSelectedAction(null);
            loadActions();
        } catch {
            toast.error('Erro ao excluir ação');
        }
    };

    const resetForm = () => {
        setMenuId('');
        setKey('');
        setLabel('');
        setDescription('');
    };

    const openCreateModal = () => {
        resetForm();
        setCreateModal(true);
    };

    const openEditModal = (action) => {
        setSelectedAction(action);
        setMenuId(action.menu_item_id);
        setKey(action.key);
        setLabel(action.label);
        setDescription(action.description || '');
        setEditModal(true);
    };

    const openDeleteModal = (action) => {
        setSelectedAction(action);
        setDeleteModal(true);
    };

    const toggleTooltip = (id) => {
        setTooltipOpen((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const openRolesModal = async (action) => {
        setSelectedAction(action);
        try {
            const { data } = await api.get(`/backoffice/actions/${action.id}/roles`);
            const current = data.data?.map((r) => r.id) || [];
            setSelectedRoles(current);
            setRolesModal(true);
        } catch {
            toast.error('Erro ao carregar roles vinculadas');
        }
    };

    const toggleRole = (roleId) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSaveRoles = async () => {
        try {
            await api.post('/backoffice/actions/link-roles', {
                actionId: selectedAction.id,
                roleIds: selectedRoles
            });
            toast.success('Roles vinculadas com sucesso');
            setRolesModal(false);
            loadActions();
        } catch {
            toast.error('Erro ao vincular roles');
        }
    };

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('pt-BR');

    const columns = [
        {
            name: 'Menu',
            cell: (row) => (
                <Badge color="light-info" pill>
                    {row.menuItem?.key || 'N/A'}
                </Badge>
            ),
            width: '15%'
        },
        {
            name: 'Key',
            selector: (row) => row.key,
            width: '20%'
        },
        {
            name: 'Label',
            selector: (row) => row.label,
            width: '25%'
        },
        {
            name: 'Descrição',
            cell: (row) => (
                <small className="text-muted">{row.description || '-'}</small>
            ),
            width: '25%'
        },
        {
            name: 'Roles',
            cell: (row) =>
                row.roles && row.roles.length > 0 ? (
                    <div className="d-flex flex-wrap gap-1">
                        {row.roles.map((r) => (
                            <Badge color="success" key={r.id}>
                                {r.name}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <small className="text-muted">Nenhuma</small>
                ),
            width: '15%'
        },
        {
            name: 'Ações',
            center: true,
            cell: (row) => {
                const editId = `edit-${row.id}`;
                const deleteId = `delete-${row.id}`;
                const rolesId = `roles-${row.id}`;
                return (
                    <div className="d-flex gap-1">
                        <div id={rolesId}>
                            <Badge
                                color="success"
                                size="sm"
                                onClick={() => openRolesModal(row)}
                                style={{ cursor: 'pointer' }}
                                className="d-flex align-items-center"
                            >
                                <Users size={16} />
                            </Badge>
                        </div>
                        <Tooltip
                            placement="top"
                            isOpen={tooltipOpen[rolesId] || false}
                            target={rolesId}
                            toggle={() => toggleTooltip(rolesId)}
                        >
                            Vincular roles
                        </Tooltip>

                        <div id={editId}>
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

                        <div id={deleteId}>
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
                    </div>
                );
            },
            width: '15%'
        }
    ];

    return (
        <div>
            <Card>
                <CardBody>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5>Ações ({actions.length})</h5>
                        <Button
                            color="primary"
                            className="d-flex align-items-center gap-2"
                            onClick={openCreateModal}
                        >
                            <Plus size={16} />
                            Nova Ação
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={actions}
                        dense
                        highlightOnHover
                        progressPending={loading}
                        customStyles={tableRowStyles}
                        pagination
                        paginationServer={false}
                        paginationComponentOptions={{
                            noRowsPerPage: true,
                            rangeSeparatorText: 'de'
                        }}
                        progressComponent={<LoadingSpinner />}
                        noDataComponent={
                            <div className="text-center py-4">
                                <p className="text-muted mb-0">Nenhuma ação encontrada</p>
                            </div>
                        }
                        theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
                    />
                </CardBody>
            </Card>

            {/* Modal Criação/Edição */}
            <Modal
                isOpen={createModal || editModal}
                toggle={() => {
                    setCreateModal(false);
                    setEditModal(false);
                }}
            >
                <ModalHeader
                    toggle={() => {
                        setCreateModal(false);
                        setEditModal(false);
                    }}
                >
                    {editModal ? 'Editar Ação' : 'Nova Ação'}
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label>Menu</Label>
                        <Input
                            type="select"
                            value={menuId}
                            onChange={(e) => setMenuId(e.target.value)}
                        >
                            <option value="">Selecione</option>
                            {menus.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.key}
                                </option>
                            ))}
                        </Input>
                    </FormGroup>
                    <FormGroup>
                        <Label>Key</Label>
                        <Input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Label</Label>
                        <Input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Descrição</Label>
                        <Input
                            type="textarea"
                            rows="2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="secondary"
                        onClick={() => {
                            setCreateModal(false);
                            setEditModal(false);
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onClick={editModal ? handleEditAction : handleCreateAction}
                    >
                        {editModal ? 'Salvar Alterações' : 'Criar'}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Modal Roles */}
            <Modal isOpen={rolesModal} toggle={() => setRolesModal(false)} centered>
                <ModalHeader toggle={() => setRolesModal(false)}>
                    Gerenciar Roles
                </ModalHeader>
                <ModalBody>
                    <p className="text-muted mb-2">
                        Selecione as roles que terão acesso à ação{' '}
                        <strong>{selectedAction?.label}</strong>
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                        {roles.map((role) => (
                            <Badge
                                key={role.id}
                                color={
                                    selectedRoles.includes(role.id)
                                        ? 'success'
                                        : 'light-secondary'
                                }
                                pill
                                onClick={() => toggleRole(role.id)}
                                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                {role.name}
                            </Badge>
                        ))}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setRolesModal(false)}>
                        Cancelar
                    </Button>
                    <Button color="primary" onClick={handleSaveRoles}>
                        Salvar
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Modal Exclusão */}
            {selectedAction && (
                <ConfirmAction
                    show={deleteModal}
                    setShow={setDeleteModal}
                    footer={false}
                    centered
                    simpleConfirm
                    title="Confirmar exclusão"
                    description={`Tem certeza que deseja excluir a ação "${selectedAction.label}" (${selectedAction.key})?`}
                    textAlert="Essa operação não poderá ser desfeita."
                    buttonText="Excluir"
                    handleAction={async () => {
                        await handleDeleteAction();
                        setDeleteModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default ActionsTab;
