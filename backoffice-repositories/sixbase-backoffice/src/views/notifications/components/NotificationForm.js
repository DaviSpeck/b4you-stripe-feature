import { useForm, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Flatpickr from 'react-flatpickr'
import { useState } from 'react'

import {
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    FormFeedback
} from 'reactstrap'

import '@styles/react/libs/flatpickr/flatpickr.scss'
import { createNotification } from '../../../services/notificationService'
import { api } from '../../../services/api'

import '../../../assets/scss/pages/notifications.scss'
import NotificationPreview from './NotificationPreview'
import TestNotificationModal from './TestNotificationModal'
import ConfirmNotificationModal from './ConfirmNotificationModal'

const csvToArray = (v) =>
    (v || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

const csvTransform = (value, originalValue) => {
    if (Array.isArray(originalValue) || originalValue === undefined) return value
    if (typeof originalValue === 'string') {
        const arr = csvToArray(originalValue)
        return arr.length ? arr : undefined
    }
    return undefined
}

const schema = yup
    .object({
        title: yup
            .string()
            .required('É preciso informar um título')
            .max(80, 'Máximo de 80 caracteres'),
        content: yup
            .string()
            .required('É preciso informar um conteúdo')
            .max(200, 'Máximo de 200 caracteres'),
        url: yup.string().url('Deve ser uma URL válida').notRequired(),
        image_url: yup.string().url('Deve ser uma URL de imagem válida').notRequired(),
        platforms: yup
            .array()
            .of(yup.string().oneOf(['web', 'mobile']))
            .min(1, 'Selecione ao menos uma plataforma')
            .required('Selecione ao menos uma plataforma'),
        audience: yup
            .object({
                tags: yup
                    .array()
                    .of(
                        yup.string().oneOf([
                            'producer_status',
                            'affiliate_status',
                            'user_status'
                        ])
                    )
                    .notRequired(),
                subscription_ids: yup
                    .array()
                    .transform(csvTransform)
                    .of(yup.string().uuid('Cada subscription_id deve ser UUID válido'))
                    .notRequired(),
                external_user_ids: yup
                    .array()
                    .transform(csvTransform)
                    .of(yup.string())
                    .notRequired()
            })
            .test(
                'audience-exclusive',
                'Use apenas um de: tags, subscription_ids ou external_user_ids',
                (aud) => {
                    const f1 = aud.tags?.length > 0
                    const f2 = aud.subscription_ids?.length > 0
                    const f3 = aud.external_user_ids?.length > 0
                    return [f1, f2, f3].filter(Boolean).length <= 1
                }
            )
            .default({ tags: [] }),
        schedule: yup
            .object({
                type: yup
                    .string()
                    .oneOf(['immediate', 'scheduled', 'relative'])
                    .required('Type é obrigatório'),
                send_at: yup.date().when('type', {
                    is: 'scheduled',
                    then: (s) =>
                        s
                            .required('send_at é obrigatório para scheduled')
                            .min(new Date(), 'Não pode agendar no passado'),
                    otherwise: (s) => s.strip()
                }),
                offset_in_minutes: yup.number().integer().when('type', {
                    is: 'relative',
                    then: (s) =>
                        s.required('offset_in_minutes é obrigatório para relative'),
                    otherwise: (s) => s.strip()
                })
            })
            .required('schedule é obrigatório')
    })
    .required()

const defaultValues = {
    title: '',
    content: '',
    url: '',
    image_url: '',
    platforms: [],
    audience: {
        tags: [],
        subscription_ids: '',
        external_user_ids: ''
    },
    schedule: {
        type: 'immediate',
        send_at: null,
        offset_in_minutes: ''
    }
}

export default function NotificationForm({ onSuccess, onCancel }) {
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        getValues
    } = useForm({
        mode: 'onChange',
        resolver: yupResolver(schema),
        defaultValues
    })

    const watchedTitle = useWatch({ control, name: 'title' })
    const watchedContent = useWatch({ control, name: 'content' })
    const watchedUrl = useWatch({ control, name: 'url' })
    const watchedImage = useWatch({ control, name: 'image_url' })

    const scheduleType = useWatch({
        control,
        name: 'schedule.type'
    })

    const [showTestModal, setShowTestModal] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [loadingSave, setLoadingSave] = useState(false)
    const [testLoading, setTestLoading] = useState(false)
    const [testResults, setTestResults] = useState(null)

    const handleConfirmSave = async () => {
        const data = getValues()
        const { title, content, audience: aud, schedule } = data

        const audience = {
            subscription_ids: aud.subscription_ids,
            external_user_ids: aud.external_user_ids,
            tags: aud.tags?.length ? aud.tags : undefined
        }

        const payload = {
            title,
            content,
            platforms: data.platforms,
            audience,
            schedule: { ...schedule },
            ...(data.url ? { url: data.url } : {}),
            ...(data.image_url ? { image_url: data.image_url } : {})
        }

        if (schedule.type !== 'scheduled') delete payload.schedule.send_at
        if (schedule.type !== 'relative') delete payload.schedule.offset_in_minutes

        try {
            setLoadingSave(true)
            await createNotification(payload)
            onSuccess?.()
        } finally {
            setLoadingSave(false)
            setShowConfirmModal(false)
        }
    }

    const onSubmit = () => {
        // em vez de salvar direto, abre modal de confirmação
        setShowConfirmModal(true)
    }

    const handleSendTest = async (emails) => {
        setTestLoading(true)
        setTestResults(null)
        try {
            const resolveRes = await api.post('/notifications/resolve-emails', { emails })
            const uuids = resolveRes.data.uuids || []

            if (!uuids.length) {
                setTestResults({
                    success: 0,
                    errors: ['Nenhum usuário encontrado para os e-mails fornecidos']
                })
                return
            }

            const values = getValues()
            const payload = {
                title: values.title,
                content: values.content,
                platforms: values.platforms,
                schedule: { type: 'immediate' },
                audience: { external_user_ids: uuids },
                ...(values.url ? { url: values.url } : {}),
                ...(values.image_url ? { image_url: values.image_url } : {})
            }

            const res = await api.post('/notifications/test-push-notification', payload)
            setTestResults({ success: res.data.success, errors: res.data.errors || [] })
        } catch (err) {
            setTestResults({
                success: 0,
                errors: [err.response?.data?.message || err.message]
            })
        } finally {
            setTestLoading(false)
        }
    }

    return (
        <Form className="notification-form" onSubmit={handleSubmit(onSubmit)} >
            <FormGroup className="mb-1">
                <Label for="title">Título *</Label>
                <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            id="title"
                            placeholder="Digite o título"
                            maxLength={80}
                            invalid={!!errors.title}
                        />
                    )}
                />
                <small className="text-muted">
                    {watchedTitle?.length || 0}/80 caracteres
                </small>
                {errors.title && <FormFeedback>{errors.title.message}</FormFeedback>}
            </FormGroup>

            <FormGroup>
                <Label for="content">Conteúdo *</Label>
                <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="textarea"
                            id="content"
                            rows="4"
                            placeholder="Digite o conteúdo"
                            maxLength={200}
                            invalid={!!errors.content}
                        />
                    )}
                />
                <small className="text-muted">
                    {watchedContent?.length || 0}/200 caracteres
                </small>
                {errors.content && (
                    <FormFeedback>{errors.content.message}</FormFeedback>
                )}
            </FormGroup>

            <FormGroup>
                <Label for="url">URL (clicável)</Label>
                <Controller
                    name="url"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="url"
                            id="url"
                            placeholder="https://seu.site/exemplo"
                            invalid={!!errors.url}
                        />
                    )}
                />
                {errors.url && <FormFeedback>{errors.url.message}</FormFeedback>}
            </FormGroup>

            <FormGroup>
                <Label for="image_url">URL da Imagem</Label>
                <Controller
                    name="image_url"
                    control={control}
                    render={({ field }) => (
                        <Input
                            {...field}
                            type="url"
                            id="image_url"
                            placeholder="https://seu.site/imagem.jpg"
                            invalid={!!errors.image_url}
                        />
                    )}
                />
                {errors.image_url && <FormFeedback>{errors.image_url.message}</FormFeedback>}
            </FormGroup>

            <Row>
                <Col md="12">
                    <FormGroup tag="fieldset">
                        <Label className="d-block mb-50">Filtros por Tag</Label>
                        <Controller
                            name="audience.tags"
                            control={control}
                            render={({ field }) => (
                                <>
                                    {[
                                        { label: 'Produtores', value: 'producer_status' },
                                        { label: 'Creators/Afiliados', value: 'affiliate_status' },
                                        { label: 'Usuários Inativos', value: 'user_status' }
                                    ].map(opt => (
                                        <FormGroup check inline key={opt.value}>
                                            <Input
                                                {...field}
                                                type="checkbox"
                                                id={`tag-${opt.value}`}
                                                value={opt.value}
                                                checked={field.value.includes(opt.value)}
                                                onChange={e => {
                                                    const next = e.target.checked
                                                        ? [...field.value, opt.value]
                                                        : field.value.filter(v => v !== opt.value);
                                                    field.onChange(next);
                                                }}
                                            />
                                            <Label check for={`tag-${opt.value}`}>
                                                {opt.label}
                                            </Label>
                                        </FormGroup>
                                    ))}
                                </>
                            )}
                        />
                        {errors.audience?.tags && (
                            <FormFeedback className="d-block">
                                {errors.audience.tags.message}
                            </FormFeedback>
                        )}
                    </FormGroup>
                </Col>
                <Col md="12">
                    <FormGroup tag="fieldset">
                        <Label className="d-block mb-50">Plataforma *</Label>
                        <Controller
                            name="platforms"
                            control={control}
                            render={({ field }) => (
                                <>
                                    {[
                                        { label: 'Web', value: 'web' },
                                        { label: 'Mobile', value: 'mobile' },
                                    ].map((opt) => (
                                        <FormGroup check inline key={opt.value}>
                                            <Input
                                                {...field}
                                                type="checkbox"
                                                id={`platform-${opt.value}`}
                                                value={opt.value}
                                                checked={field.value.includes(opt.value)}
                                                onChange={(e) => {
                                                    const next = e.target.checked
                                                        ? [...field.value, opt.value]
                                                        : field.value.filter((v) => v !== opt.value);
                                                    field.onChange(next);
                                                }}
                                            />
                                            <Label check for={`platform-${opt.value}`}>
                                                {opt.label}
                                            </Label>
                                        </FormGroup>
                                    ))}
                                </>
                            )}
                        />
                        {errors.platforms && (
                            <FormFeedback className="d-block">
                                {errors.platforms.message}
                            </FormFeedback>
                        )}
                    </FormGroup>
                </Col>
                {/* <Col md="4">
                    <FormGroup>
                        <Label for="subs">Subscription IDs (csv)</Label>
                        <Controller
                            name="audience.subscription_ids"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="subs"
                                    placeholder="id1,id2"
                                    invalid={!!errors.audience?.subscription_ids}
                                />
                            )}
                        />
                        {errors.audience?.subscription_ids && (
                            <FormFeedback>
                                {errors.audience.subscription_ids.message}
                            </FormFeedback>
                        )}
                    </FormGroup>
                </Col> */}
                {/* <Col md="4">
                    <FormGroup>
                        <Label for="ext">External User IDs (csv)</Label>
                        <Controller
                            name="audience.external_user_ids"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="ext"
                                    placeholder="user1,user2"
                                    invalid={!!errors.audience?.external_user_ids}
                                />
                            )}
                        />
                        {errors.audience?.external_user_ids && (
                            <FormFeedback>
                                {errors.audience.external_user_ids.message}
                            </FormFeedback>
                        )}
                    </FormGroup>
                </Col> */}
            </Row>

            <FormGroup tag="fieldset">
                <Label className="d-block mb-50">Agendamento</Label>
                <Controller
                    name="schedule.type"
                    control={control}
                    render={({ field }) => (
                        <>
                            <FormGroup check inline>
                                <Input
                                    {...field}
                                    type="radio"
                                    id="sched-immediate"
                                    value="immediate"
                                    checked={field.value === 'immediate'}
                                />
                                <Label check for="sched-immediate">
                                    Imediato
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Input
                                    {...field}
                                    type="radio"
                                    id="sched-scheduled"
                                    value="scheduled"
                                    checked={field.value === 'scheduled'}
                                />
                                <Label check for="sched-scheduled">
                                    Data/hora exata
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>
                                <Input
                                    {...field}
                                    type="radio"
                                    id="sched-relative"
                                    value="relative"
                                    checked={field.value === 'relative'}
                                />
                                <Label check for="sched-relative">
                                    Daqui a ... minutos
                                </Label>
                            </FormGroup>
                        </>
                    )}
                />
            </FormGroup>

            {scheduleType === 'scheduled' && (
                <FormGroup>
                    <Label for="send_at">Data/hora de envio *</Label>
                    <Controller
                        name="schedule.send_at"
                        control={control}
                        render={({ field }) => (
                            <Flatpickr
                                {...field}
                                id="send_at"
                                className={`form-control ${errors.schedule?.send_at ? 'is-invalid' : ''
                                    }`}
                                options={{ enableTime: true, dateFormat: 'd/m/Y H:i' }}
                                placeholder="Escolha a data/hora"
                            />
                        )}
                    />
                    {errors.schedule?.send_at && (
                        <FormFeedback className="d-block">
                            {errors.schedule.send_at.message}
                        </FormFeedback>
                    )}
                </FormGroup>
            )}

            {scheduleType === 'relative' && (
                <FormGroup>
                    <Label for="offset">Minutos a partir de agora *</Label>
                    <Controller
                        name="schedule.offset_in_minutes"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="offset"
                                type="number"
                                min="1"
                                invalid={!!errors.schedule?.offset_in_minutes}
                            />
                        )}
                    />
                    {errors.schedule?.offset_in_minutes && (
                        <FormFeedback>
                            {errors.schedule.offset_in_minutes.message}
                        </FormFeedback>
                    )}
                </FormGroup>
            )}

            <h5 className="mt-1 mb-1">Pré-visualização</h5>
            <NotificationPreview
                title={watchedTitle}
                content={watchedContent}
                url={watchedUrl}
                image={watchedImage}
            />

            <div className="form-buttons d-flex justify-content-end mt-2">
                <Button color="secondary" className="me-1" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" color="success" className="me-1">
                    Salvar
                </Button>
                <Button
                    type="button"
                    color="info"
                    onClick={() => setShowTestModal(true)}
                    disabled={!isValid}
                >
                    Testar Notificação
                </Button>
            </div>

            <TestNotificationModal
                isOpen={showTestModal}
                onToggle={() => setShowTestModal(false)}
                basePayload={getValues()}
                onSendTest={handleSendTest}
                loading={testLoading}
                results={testResults}
            />

            <ConfirmNotificationModal
                isOpen={showConfirmModal}
                onToggle={() => setShowConfirmModal(false)}
                basePayload={getValues()}
                onConfirm={handleConfirmSave}
                loading={loadingSave}
            />
        </Form>
    )
}