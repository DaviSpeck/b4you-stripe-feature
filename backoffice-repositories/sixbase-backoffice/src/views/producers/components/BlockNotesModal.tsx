import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Spinner,
} from 'reactstrap';
import { Lock, Unlock } from 'react-feather';
import moment from 'moment';
import { toast } from 'react-toastify';
import { api } from 'services/api';
import { configNotify } from 'configs/toastConfig';

interface UserBackoffice {
    full_name?: string;
}

interface BlockNote {
    id?: string | number;
    id_type?: number; // 0 = bloqueio, 1 = desbloqueio
    text?: string;
    created_at?: string;
    updated_at?: string;
    user_backoffice?: UserBackoffice;
}

interface BlockNotesModalProps {
    show: boolean;
    loading: boolean;
    notes: BlockNote[];
    userUuid: string;
    onClose: () => void;
}

const BlockNotesModal: React.FC<BlockNotesModalProps> = ({
    show,
    loading,
    notes,
    userUuid,
    onClose,
}) => {
    const [automationEnabled, setAutomationEnabled] = useState<boolean | null>(
        null,
    );
    const [fetching, setFetching] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (show && userUuid) {
            fetchAutomationStatus();
        }
    }, [show, userUuid]);

    const fetchAutomationStatus = async () => {
        setFetching(true);
        try {
            const { data } = await api.get(
                `users/${userUuid}/automation/block-withdrawal`,
            );
            setAutomationEnabled(data?.enabled ?? false);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao buscar status da automação', configNotify);
        } finally {
            setFetching(false);
        }
    };

    const toggleAutomation = async () => {
        if (automationEnabled === null) return;

        setUpdating(true);
        try {
            const newStatus = !automationEnabled;
            await api.put(`users/${userUuid}/automation/block-withdrawal`, {
                enabled: newStatus,
            });

            setAutomationEnabled(newStatus);
            toast.success(
                newStatus
                    ? 'Automação de bloqueio/desbloqueio de saque ativada com sucesso'
                    : 'Automação de bloqueio/desbloqueio de saque desativada com sucesso',
                configNotify,
            );
        } catch (error) {
            console.error(error);
            toast.error('Erro ao alterar automação de bloqueio/desbloqueio de saque', configNotify);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <Modal
            isOpen={show}
            toggle={onClose}
            centered
            size="lg"
        >
            <ModalHeader toggle={onClose}>
                Notas de Bloqueio/Desbloqueio
            </ModalHeader>
            <ModalBody>
                {loading ? (
                    <div className="text-center">
                        <Spinner />
                        <p>Carregando notas...</p>
                    </div>
                ) : notes.length > 0 ? (
                    <div
                        className={notes.length >= 3 ? "block-notes-scroll" : ""}
                        style={notes.length >= 3 ? { maxHeight: '400px', overflowY: 'auto' } : {}}
                    >
                        {notes.map((note, index) => (
                            <div key={note.id || index} className="mb-3 p-3 border rounded">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <strong>
                                            {note.id_type === 0 ? 'Nota de Bloqueio' : note.id_type === 1 ? 'Nota de Desbloqueio' : `Nota #${index + 1}`}
                                        </strong>
                                        <div className="text-muted small">
                                            Criado por: {note.user_backoffice?.full_name || 'Sistema'}
                                        </div>
                                    </div>
                                    <small className="text-muted">
                                        {note.created_at ? moment(note.created_at).format('DD/MM/YYYY HH:mm') : 'Data não disponível'}
                                    </small>
                                </div>
                                <div className="mb-2">
                                    <p className="mb-1 text-break" style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                        {note.text || 'Motivo não especificado'}
                                    </p>
                                </div>
                                {note.updated_at && note.updated_at !== note.created_at && (
                                    <small className="text-muted">
                                        Atualizado em: {moment(note.updated_at).format('DD/MM/YYYY HH:mm')}
                                    </small>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted">
                        <p>Nenhuma nota de bloqueio/desbloqueio encontrada.</p>
                    </div>
                )}
            </ModalBody>
            <ModalFooter className="d-flex justify-content-end align-items-center">
                {automationEnabled !== null && (
                    <Button
                        color={automationEnabled ? 'danger' : 'success'}
                        size="sm"
                        className="d-inline-flex align-items-center px-2"
                        onClick={toggleAutomation}
                        disabled={updating}
                        outline
                        style={{
                            fontWeight: 500,
                            borderRadius: 6,
                            height: 36,
                        }}
                    >
                        {updating ? (
                            <Spinner size="sm" className="me-1" />
                        ) : automationEnabled ? (
                            <Lock size={15} className="me-1" />
                        ) : (
                            <Unlock size={15} className="me-1" />
                        )}
                        {automationEnabled
                            ? 'Desativar automação'
                            : 'Ativar automação'}
                    </Button>
                )}

                <Button
                    color="secondary"
                    onClick={onClose}
                    size="sm"
                    className="ms-2 px-3"
                    style={{
                        borderRadius: 6,
                        height: 36,
                    }}
                >
                    Fechar
                </Button>
            </ModalFooter>
        </Modal >
    );
};

export default BlockNotesModal;
