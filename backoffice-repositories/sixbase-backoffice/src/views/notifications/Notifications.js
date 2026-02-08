import { useState, useCallback } from 'react'
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody,
} from 'reactstrap'
import { PlusCircle } from 'react-feather'

import NotificationForm from './components/NotificationForm'
import NotificationsList from './components/NotificationsList'
import NotificationEventsList from './components/events/NotificationEventsList'

import '../../assets/scss/pages/notifications.scss'

export default function NotificationsPage() {
    const [refreshToggle, setRefreshToggle] = useState(false)
    const [openCanvas, setOpenCanvas] = useState(false)
    const [openEventsCanvas, setOpenEventsCanvas] = useState(false)
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('')

    const reloadList = useCallback(() => {
        setLoading(true)
        setRefreshToggle(v => !v)
        setTimeout(() => setLoading(false), 300)
    }, [])

    const openEvents = () => {
        setOpenCanvas(false)
        setOpenEventsCanvas(true)
    }

    const openCreate = () => {
        setOpenEventsCanvas(false)
        setOpenCanvas(true)
    }

    const closeEvents = () => setOpenEventsCanvas(false)
    const closeCreate = () => setOpenCanvas(false)

    return (
        <section className="notification-page">
            <h2 className="mb-2">Notificações</h2>
            <p className="text-muted mb-3">
                Se comunique com creators/afiliados, produtores e usuários inativos.
            </p>

            <Card>
                <CardHeader className="d-flex align-items-center justify-content-end gap-1">
                    <Button
                        color="secondary"
                        outline
                        onClick={openEvents}
                    >
                        Eventos automáticos
                    </Button>

                    <Button
                        color="primary"
                        onClick={openCreate}
                        className="btn-circle d-flex align-items-center justify-content-center"
                    >
                        <PlusCircle size={20} />
                        <span className="d-none d-sm-inline ms-2">
                            Nova notificação
                        </span>
                    </Button>
                </CardHeader>

                <CardBody>
                    <NotificationsList
                        key={String(refreshToggle)}
                        filterText={filter}
                    />
                </CardBody>
            </Card>

            {/* Criar notificação */}
            <Offcanvas
                direction="end"
                isOpen={openCanvas}
                toggle={closeCreate}
                backdrop
                className="notification-offcanvas"
            >
                <OffcanvasHeader toggle={closeCreate}>
                    Criar notificação
                </OffcanvasHeader>
                <OffcanvasBody>
                    <NotificationForm
                        onSuccess={() => {
                            closeCreate()
                            reloadList()
                        }}
                        onCancel={closeCreate}
                    />
                </OffcanvasBody>
            </Offcanvas>

            {/* Eventos automáticos */}
            <Offcanvas
                direction="end"
                isOpen={openEventsCanvas}
                toggle={closeEvents}
                backdrop
                className="notification-offcanvas"
            >
                <OffcanvasHeader toggle={closeEvents}>
                    Eventos automáticos
                </OffcanvasHeader>

                <OffcanvasBody>
                    <NotificationEventsList />
                </OffcanvasBody>
            </Offcanvas>
        </section>
    )
}