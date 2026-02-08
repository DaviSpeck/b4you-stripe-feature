import { FC, useState } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup,
    Label,
    Input,
    Button,
    Spinner,
    Alert,
} from 'reactstrap';

interface TestNotificationModalProps {
    isOpen: boolean;
    onToggle: () => void;
    basePayload: any;
    onSendTest: (emails: string[]) => Promise<void>;
    loading: boolean;
    results?: { success: number; errors: string[] } | null;
}

const TestNotificationModal: FC<TestNotificationModalProps> = ({
    isOpen,
    onToggle,
    basePayload,
    onSendTest,
    loading,
    results,
}) => {
    const [emailsText, setEmailsText] = useState('');

    const handleSubmit = async () => {
        const emails = emailsText
            .split(',')
            .map((s) => s.trim())
            .filter((s) => !!s && s.includes('@'));
        if (emails.length === 0) return;
        await onSendTest(emails);
    };

    return (
        <Modal isOpen={isOpen} toggle={onToggle} centered>
            <ModalHeader toggle={onToggle}>Testar Notificação</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="emails">Lista de E-mails (separados por vírgula)</Label>
                    <Input
                        type="textarea"
                        id="emails"
                        rows={4}
                        placeholder="exemplo@teste.com, outro@teste.com"
                        value={emailsText}
                        onChange={(e) => setEmailsText(e.target.value)}
                    />
                </FormGroup>

                {results && (
                    <Alert color={results.errors.length === 0 ? 'success' : 'warning'}>
                        <h6>Resultado:</h6>
                        <p>
                            <strong>Sucessos:</strong> {results.success}
                        </p>
                        {results.errors.length > 0 && (
                            <>
                                <strong>Erros:</strong>
                                <ul>
                                    {results.errors.map((err, i) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </Alert>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={onToggle}>
                    Cancelar
                </Button>
                <Button
                    color="primary"
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    {loading ? <Spinner size="sm" className="me-1" /> : null}
                    {loading ? 'Enviando...' : 'Enviar Teste'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default TestNotificationModal;
