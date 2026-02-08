import { FC } from 'react'
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Alert,
    Badge
} from 'reactstrap'
import NotificationPreview from './NotificationPreview'

interface ConfirmNotificationModalProps {
    isOpen: boolean
    onToggle: () => void
    basePayload: any
    onConfirm: () => Promise<void> | void
    loading?: boolean
}

const ConfirmNotificationModal: FC<ConfirmNotificationModalProps> = ({
    isOpen,
    onToggle,
    basePayload,
    onConfirm,
    loading
}) => {
    const { title, content, platforms, audience, url, image_url } = basePayload || {}

    return (
        <Modal isOpen={isOpen} toggle={onToggle} centered size="lg">
            <ModalHeader toggle={onToggle}>Confirmar envio</ModalHeader>
            <ModalBody>
                <div className="mb-2">
                    <p><strong>Título:</strong> {title || '-'}</p>
                    <p><strong>Conteúdo:</strong> {content || '-'}</p>
                    <div className="mb-2">
                        <p><strong>Plataformas:</strong></p>
                        {platforms?.length
                            ? platforms.map((p) => (
                                <Badge key={p} color={p === 'web' ? 'info' : 'success'} className="me-50">
                                    {p === 'web' ? 'Web' : 'Mobile'}
                                </Badge>
                            ))
                            : <span>-</span>
                        }

                        {audience?.tags?.length > 0 && (
                            <>
                                <p className="mt-1"><strong>Tags:</strong></p>
                                {audience.tags.map((t) => {
                                    const label =
                                        t === 'producer_status' ? 'Produtores' :
                                            t === 'affiliate_status' ? 'Creators/Afiliados' :
                                                t === 'user_status' ? 'Usuários Inativos' :
                                                    t
                                    return (
                                        <Badge key={t} color="secondary" className="me-50">
                                            {label}
                                        </Badge>
                                    )
                                })}
                            </>
                        )}
                    </div>
                    {audience?.subscription_ids?.length > 0 && (
                        <p><strong>Subscription IDs:</strong> {audience.subscription_ids.join(', ')}</p>
                    )}
                    {audience?.external_user_ids?.length > 0 && (
                        <p><strong>External User IDs:</strong> {audience.external_user_ids.join(', ')}</p>
                    )}
                </div>

                {/* Pré-visualização integrada */}
                <h6 className="mb-1">Pré-visualização</h6>
                <NotificationPreview
                    title={title}
                    content={content}
                    url={url}
                    image={image_url}
                />

                <Alert color="warning" className="mt-3">
                    ⚠️ Todos os usuários com essa configuração receberão a notificação{' '}
                    <strong>
                        {platforms?.includes('web') && platforms?.includes('mobile')
                            ? 'APP e WEB'
                            : platforms?.includes('web')
                                ? 'WEB'
                                : 'APP'}
                    </strong>.
                    <br />
                    👉 Recomendamos <strong>testar primeiro</strong> antes de salvar definitivo.
                </Alert>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={onToggle} disabled={loading}>
                    Cancelar
                </Button>
                <Button color="success" onClick={onConfirm} disabled={loading}>
                    {loading ? 'Enviando...' : 'Confirmar envio'}
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default ConfirmNotificationModal