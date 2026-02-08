/* eslint-disable react/prop-types */
import {
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody,
    Badge
} from 'reactstrap'
import { ExternalLink } from 'react-feather'

const formatDate = iso =>
    iso
        ? new Date(iso).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        })
        : '—'

const channelIcon = channel => {
    switch (channel) {
        case 'push':
            return '💻 Push'
        case 'email':
            return '✉️ E‑mail'
        case 'sms':
            return '📱 SMS'
        default:
            return '—'
    }
}

const formatTag = tag => {
    switch (tag) {
        case 'user_status':
            return 'Inativo'
        case 'affiliate_status':
            return 'Creator/Afiliado'
        case 'producer_status':
            return 'Produtor'
        default:
            return tag
    }
}

export function NotificationDetailOffcanvas({ viewItem, toggleDetail }) {
    if (!viewItem) return null

    const schedule = viewItem.schedules?.[0] ?? {}
    const hist = schedule.history ?? []
    const lastHist = hist[hist.length - 1] ?? {}

    const statusColor = {
        queued: 'secondary',
        sent: 'success',
        failed: 'danger'
    }[lastHist.status] || 'light'

    return (
        <Offcanvas
            direction="end"
            isOpen={!!viewItem}
            toggle={toggleDetail}
            className="notification-offcanvas-detail"
        >
            <OffcanvasHeader toggle={toggleDetail}>
                Detalhes da Notificação #{viewItem.id}
            </OffcanvasHeader>

            <OffcanvasBody className="pt-0">
                <h5 className="mt-1 mb-3 fw-semibold">{viewItem.title}</h5>

                <div className="d-flex flex-wrap gap-2 mb-3">
                    <Badge color="info" pill>{channelIcon(viewItem.channel)}</Badge>
                    <Badge color="primary" pill>
                        {schedule.schedule_type === 'immediate' ? 'Agora' : 'Agendado'}
                    </Badge>
                    {/* <Badge color={statusColor} pill className="text-capitalize">
                        {lastHist.status || 'pendente'}
                    </Badge> */}
                    {lastHist.successful !== undefined && (
                        <Badge color="success" pill>
                            {lastHist.successful}/{lastHist.failed}
                        </Badge>
                    )}
                </div>

                {viewItem.image_url && (
                    <img
                        src={viewItem.image_url}
                        alt="banner"
                        className="rounded w-100 mb-3"
                        style={{ objectFit: 'cover', maxHeight: 180 }}
                    />
                )}

                <dl className="row small mb-0">
                    <dt className="col-4">Conteúdo</dt>
                    <dd className="col-8">{viewItem.content || '—'}</dd>

                    <dt className="col-4">Link</dt>
                    <dd className="col-8">
                        {viewItem.url ? (
                            <a href={viewItem.url} $1 className="break-link" title={viewItem.url}>
                                {viewItem.url} <ExternalLink size={12} className="ms-1" />
                            </a>
                        ) : (
                            '—'
                        )}
                    </dd>

                    <dt className="col-4">Criada em</dt>
                    <dd className="col-8">{formatDate(viewItem.created_at)}</dd>

                    <dt className="col-4">Envio</dt>
                    <dd className="col-8">{formatDate(schedule.send_at)}</dd>

                    <dt className="col-4">Tags</dt>
                    <dd className="col-8">
                        {(viewItem.audience?.tags || []).map(t => (
                            <Badge key={t} color="dark" pill className="me-1">
                                {formatTag(t)}
                            </Badge>
                        ))}
                        {!viewItem.audience?.tags?.length && '—'}
                    </dd>
                </dl>
            </OffcanvasBody>
        </Offcanvas>
    )
}
