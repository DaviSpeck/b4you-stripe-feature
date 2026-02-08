import { FC } from 'react'
import {
    Card,
    CardBody,
    Badge,
    Button,
    FormGroup,
    Input,
    Label
} from 'reactstrap'
import { NotificationEvent } from './types'

interface NotificationEventRowProps {
    event: NotificationEvent
    onToggleActive: (id: number, active: boolean) => void
    onConfigure: (id: number) => void
}

const NotificationEventRow: FC<NotificationEventRowProps> = ({
    event,
    onToggleActive,
    onConfigure
}) => {
    return (
        <Card className="mb-1">
            <CardBody className="d-flex justify-content-between align-items-center">
                <div>
                    <strong>{event.title}</strong>

                    <div className="text-muted small">
                        {event.description || '—'}
                    </div>

                    {event.trigger && (
                        <Badge color="info" className="mt-50">
                            {event.trigger.label}
                        </Badge>
                    )}
                </div>

                <div className="d-flex align-items-center gap-1">
                    <FormGroup switch>
                        <Input
                            type="switch"
                            checked={event.is_active}
                            onChange={(e) =>
                                onToggleActive(event.id, e.target.checked)
                            }
                        />
                        <Label check />
                    </FormGroup>

                    {event.is_active && (
                        <Button
                            size="sm"
                            color="secondary"
                            outline
                            onClick={() => onConfigure(event.id)}
                        >
                            Configurar
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    )
}

export default NotificationEventRow