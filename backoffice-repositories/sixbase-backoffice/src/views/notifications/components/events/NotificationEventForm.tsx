import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody,
    FormGroup,
    Label,
    Input,
    Button
} from 'reactstrap'
import {
    updateNotificationEvent,
    getNotificationEventById
} from 'services/notification-events.service'
import { NotificationEvent } from './types'

interface FormValues {
    is_active: boolean
    template_key: string
    description: string
    delay_seconds: number
}

interface Props {
    eventId: number
    onClose: () => void
    onSaved: () => void
}

export default function NotificationEventForm({
    eventId,
    onClose,
    onSaved
}: Props) {
    const [event, setEvent] = useState<NotificationEvent | null>(null)
    const [loading, setLoading] = useState(true)

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue
    } = useForm<FormValues>({
        defaultValues: {
            is_active: false,
            template_key: '',
            description: '',
            delay_seconds: 0
        }
    })

    // 🔁 Sempre buscar o estado atual no backend
    useEffect(() => {
        const load = async () => {
            setLoading(true)

            const data = await getNotificationEventById(eventId)
            setEvent(data)

            reset({
                is_active: data.is_active,
                template_key: data.template_key,
                description: data.description ?? '',
                delay_seconds: data.delay_seconds ?? 0
            })

            setLoading(false)
        }

        load()
    }, [eventId, reset])

    if (loading || !event) {
        return (
            <Offcanvas isOpen direction="end">
                <OffcanvasBody>
                    <div className="text-muted">Carregando evento…</div>
                </OffcanvasBody>
            </Offcanvas>
        )
    }

    const triggerKey = event.trigger?.key

    const onSubmit = async (data: FormValues) => {
        const payload: any = {
            is_active: data.is_active,
            template_key: data.template_key,
            description: data.description || null
        }

        if (triggerKey === 'sqs') {
            payload.delay_seconds = Number(data.delay_seconds) || 0
        } else {
            payload.delay_seconds = null
        }

        await updateNotificationEvent(event.id, payload)
        onSaved()
    }

    return (
        <Offcanvas
            isOpen
            direction="end"
            toggle={onClose}
            className="notification-offcanvas-detail"
        >
            <OffcanvasHeader toggle={onClose}>
                {event.title}
            </OffcanvasHeader>

            <OffcanvasBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Switch */}
                    <FormGroup switch className="mb-2">
                        <Input
                            type="switch"
                            checked={watch('is_active')}
                            onChange={(e) =>
                                setValue('is_active', e.target.checked)
                            }
                        />
                        <Label check>Evento ativo</Label>
                    </FormGroup>

                    {/* Template */}
                    <FormGroup className="mb-2">
                        <Label>Template (Botmaker)</Label>
                        <Controller
                            name="template_key"
                            control={control}
                            render={({ field }) => (
                                <Input {...field} />
                            )}
                        />
                    </FormGroup>

                    {/* Descrição */}
                    <FormGroup className="mb-2">
                        <Label>Descrição</Label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="textarea"
                                    rows={3}
                                    {...field}
                                />
                            )}
                        />
                    </FormGroup>

                    {/* Delay somente para SQS */}
                    {triggerKey === 'sqs' && (
                        <FormGroup className="mb-2">
                            <Label>Delay (segundos)</Label>
                            <Controller
                                name="delay_seconds"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        min={0}
                                        {...field}
                                    />
                                )}
                            />
                        </FormGroup>
                    )}

                    <div className="d-flex justify-content-end mt-3">
                        <Button
                            color="secondary"
                            type="button"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>

                        <Button
                            color="primary"
                            type="submit"
                            className="ms-1"
                        >
                            Salvar
                        </Button>
                    </div>
                </form>
            </OffcanvasBody>
        </Offcanvas>
    )
}