import { useCallback, useMemo, useState, useEffect, FC } from 'react';
import { Modal, ModalBody, ModalHeader, Table } from 'reactstrap';
import {
  ModalDetailsWrapperProps,
  UseModalDetailsReturn,
  ModalDetailsState,
  OnboardingRecord,
} from '../../interfaces/onboarding.interface';
import { getFormById, FormQuestion } from '../../services/forms.service';

export const questionsByUserType: Record<string, Record<string, string>> = {
  creator: {
    has_experience_as_creator_or_affiliate:
      'Já teve experiência como creators ou afiliados?',
    nicho: 'Com quais nichos você se identifica?',
    nicho_other: 'Qual?',
    audience_size: 'Qual o tamanho da sua audiência (seguidores)?',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    origem: 'Como você descobriu a B4YOU?',
    origem_other: 'Qual?',
  },

  marca: {
    business_model: 'Qual o seu modelo de negócio?',
    business_model_other: 'Qual?',
    nicho: 'Com quais nichos você se identifica?',
    nicho_other: 'Qual?',
    company_size: 'Quantos funcionários sua empresa possui?',
    worked_with_affiliates: 'Já trabalhou com creators ou afiliados?',
    invested_in_affiliates: 'Quanto você já investiu em campanhas?',
    worked_another_platform: 'Já trabalhou com outra plataforma?',
    platform: 'Qual plataforma?',
    platform_other: 'Qual?',
    origem: 'Como você descobriu a B4YOU?',
    origem_other: 'Qual?',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    revenue: 'Faturamento mensal?'
  },
};

const formTypeLabelMap: Record<number, string> = {
  2: 'Creator',
  3: 'Marca',
};

const normalizeValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '-';

  if (Array.isArray(value)) return value.join(', ');

  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';

  if (typeof value === 'object') return JSON.stringify(value);

  return String(value);
};

export const ModalDetailsWrapper: FC<ModalDetailsWrapperProps> = ({
  row,
  showModalDetails,
  setShowModalDetails,
}) => {
  const { onboarding, form } = row || {};
  const [formQuestions, setFormQuestions] = useState<FormQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    const loadFormQuestions = async () => {
      if (form?.id && showModalDetails) {
        setLoadingQuestions(true);
        try {
          const formData = await getFormById(form.id);
          setFormQuestions(formData.questions || []);
        } catch (error) {
          console.error('Erro ao carregar perguntas do formulário:', error);
          setFormQuestions([]);
        } finally {
          setLoadingQuestions(false);
        }
      } else {
        setFormQuestions([]);
      }
    };
    loadFormQuestions();
  }, [form?.id, showModalDetails]);

  const staticLabels = useMemo(
    () => questionsByUserType[onboarding?.user_type || ''] || {},
    [onboarding?.user_type],
  );

  const displayQuestions = useMemo(() => {
    if (!onboarding) return [];

    if (formQuestions.length > 0) {
      return formQuestions
        .sort((a, b) => a.order - b.order)
        .map((q) => ({
          key: q.key,
          label: q.label,
          value: normalizeValue(onboarding[q.key]),
        }));
    }

    return Object.entries(onboarding)
      .filter(
        ([key]) =>
          key !== 'user_type' &&
          key !== 'created_at' &&
          key !== 'date' &&
          key !== 'time',
      )
      .map(([key, value]) => ({
        key,
        label: staticLabels[key] || key,
        value: normalizeValue(value),
      }));
  }, [formQuestions, onboarding, staticLabels]);

  if (!onboarding) return null;

  return (
    <Modal
      isOpen={showModalDetails}
      toggle={() => setShowModalDetails(false)}
      centered
      size="lg"
    >
      <ModalHeader toggle={() => setShowModalDetails(false)}>
        {`Onboarding - ${onboarding.user_type}`}
      </ModalHeader>

      <ModalBody>
        {form && (
          <div className="d-flex align-items-center gap-2 mb-2 mt-1">
            <strong>Formulário preenchido:</strong>
            <div>
              {form.title} — {formTypeLabelMap[form.form_type]} · v
              {form.version}
            </div>
          </div>
        )}

        <Table hover>
          <tbody>
            {loadingQuestions ? (
              <tr>
                <td colSpan={2} className="text-center">
                  Carregando perguntas...
                </td>
              </tr>
            ) : displayQuestions.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center text-muted">
                  Nenhuma pergunta encontrada
                </td>
              </tr>
            ) : (
              displayQuestions.map((item) => (
                <tr key={item.key}>
                  <th scope="row">{item.label}</th>
                  <td>{item.value}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </ModalBody>
    </Modal>
  );
};

export const useModalDetails = (): UseModalDetailsReturn => {
  const [modalDetails, setModalDetails] = useState<ModalDetailsState>({
    showModalDetails: false,
    row: {} as OnboardingRecord,
  });

  const ModalDetails = useCallback(
    () => (
      <ModalDetailsWrapper
        row={modalDetails.row}
        showModalDetails={modalDetails.showModalDetails}
        setShowModalDetails={(showModalDetails: boolean) =>
          setModalDetails((prev) => ({ ...prev, showModalDetails }))
        }
      />
    ),
    [modalDetails],
  );

  return useMemo(
    () => ({
      ModalDetails,
      setModalDetails,
    }),
    [ModalDetails],
  );
};