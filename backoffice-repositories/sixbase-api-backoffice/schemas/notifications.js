const yup = require('yup');

exports.createNotificationSchema = yup
    .object({
        title: yup
            .string()
            .required('É preciso informar um título')
            .max(80, 'Máximo de 80 caracteres'),

        content: yup
            .string()
            .required('É preciso informar um conteúdo'),

        url: yup.string().url('URL inválida').notRequired(),
        image_url: yup.string().url('URL de imagem inválida').notRequired(),

        platforms: yup
            .array()
            .of(yup.string().oneOf(['web', 'mobile']))
            .min(1, 'Selecione ao menos uma plataforma')
            .required('Selecione ao menos uma plataforma'),

        audience: yup
            .object({
                tags: yup
                    .array()
                    .transform((value) => {
                        if (value === "" || value == null) return [];
                        return Array.isArray(value) ? value : [];
                    })
                    .of(
                        yup.string().oneOf([
                            'producer_status',
                            'affiliate_status',
                            'user_status',
                        ])
                    )
                    .default([]),

                subscription_ids: yup
                    .array()
                    .transform((value) => {
                        if (value === "" || value == null) return [];
                        return Array.isArray(value) ? value : [];
                    })
                    .of(
                        yup.string().uuid('Cada subscription_id deve ser UUID válido')
                    )
                    .default([]),

                external_user_ids: yup
                    .array()
                    .transform((value) => {
                        if (value === "" || value == null) return [];
                        return Array.isArray(value) ? value : [];
                    })
                    .of(yup.string())
                    .default([]),
            })
            .test(
                'audience-exclusive',
                'Use apenas um de: tags, subscription_ids ou external_user_ids',
                (aud) => {
                    if (!aud) return true;
                    const f1 = aud.tags?.length > 0;
                    const f2 = aud.subscription_ids?.length > 0;
                    const f3 = aud.external_user_ids?.length > 0;
                    return [f1, f2, f3].filter(Boolean).length <= 1;
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
                    otherwise: (s) => s.strip(),
                }),

                offset_in_minutes: yup
                    .mixed()
                    .transform((v) =>
                        typeof v === "string" ? Number(v) : v
                    )
                    .when('type', {
                        is: 'relative',
                        then: (s) =>
                            s
                                .required('offset_in_minutes é obrigatório para relative')
                                .typeError('offset_in_minutes deve ser um número'),
                        otherwise: (s) => s.strip(),
                    }),
            })
            .required('schedule é obrigatório'),
    })
    .required();

exports.resolveEmailsSchema = yup.object({
    emails: yup
        .array()
        .of(yup.string().email("Cada email deve ser válido"))
        .min(1, "É preciso enviar pelo menos um email")
        .required("Emails são obrigatórios"),
});