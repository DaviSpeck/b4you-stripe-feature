import React from 'react';
import { Card, Container, ProgressBar } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import { notify } from '../../../modules/functions';
import ButtonDS from '../../components/design-system/ButtonDS';
import { submitAnswers } from '../../../services/forms';
import DynamicOnboardingForm from '../../components/DynamicOnboardingForm';
import userStorage from '../../../utils/storage';
import { useUser } from '../../../providers/contextUser';
import api from '../../../providers/api';

const STATUS = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  started: 'started',
  error: 'error',
};

const Onboarding = () => {
  const [selectedPage, setSelectedPage] = React.useState(0);
  const [flowType, setFlowType] = React.useState(null);
  const [status, setStatus] = React.useState(STATUS.idle);

  const [dynamicForm, setDynamicForm] = React.useState({
    id_form: null,
    answers: {},
  });

  const [dynamicMeta, setDynamicMeta] = React.useState({
    current: 0,
    total: 0,
    canNext: false,
    isFinished: false,
    next: null,
    prev: null,
  });

  const handleMetaChange = React.useCallback((meta) => {
    setDynamicMeta(meta);
  }, []);

  const { handleSubmit } = useForm();
  const { setUser } = useUser();

  const onSubmit = async () => {
    if (!dynamicForm.id_form) {
      notify({ type: 'error', message: 'Formulário não carregado.' });
      return;
    }

    setStatus(STATUS.loading);

    try {
      const answersArray = Object.entries(dynamicForm.answers || {}).map(
        ([key, value]) => ({ key, value })
      );

      await submitAnswers(dynamicForm.id_form, answersArray);
      const { data } = await api.get('/auth/me');
      setUser(data);

      userStorage.setOnboardingData({
        user_type: flowType,
        completed_at: new Date().toISOString(),
      });

      notify({ message: 'Preenchido com sucesso!', type: 'success' });
      setSelectedPage((prev) => prev + 1);
      setStatus(STATUS.success);

    } catch (error) {
      setStatus(STATUS.error);
      notify({
        type: 'error',
        message: error?.response?.data?.message || 'Falha ao enviar respostas',
      });
    }
  };

  const pages = [
    {
      step: 'flowType',
      progress: 10,
      content: (
        <div>
          <h5 className="mb-4">É um prazer ter você aqui! Para começar, me responda se você é:</h5>

          <label className="d-block mb-2" htmlFor="creator">
            <input
              type="radio"
              id="creator"
              value="creator"
              name="flowType"
              onChange={() => {
                setFlowType('creator');
                setDynamicForm({ id_form: null, answers: {} });
                setStatus(STATUS.started);
              }}
              checked={flowType === 'creator'}
              className="mr-2"
            />
            Sou Creator/Afiliado — quero divulgar e vender produtos de outras marcas
          </label>

          <label className="d-block" htmlFor="marca">
            <input
              type="radio"
              id="marca"
              value="marca"
              name="flowType"
              onChange={() => {
                setFlowType('marca');
                setDynamicForm({ id_form: null, answers: {} });
                setStatus(STATUS.started);
              }}
              checked={flowType === 'marca'}
              className="mr-2"
            />
            Sou Marca/Produtor(a) — quero colocar meus produtos para venda na B4YOU
          </label>
        </div>
      ),
    },

    flowType && {
      step: 'dynamic_form',
      progress: 70,
      content: (
        <DynamicOnboardingForm
          initialType={flowType === 'creator' ? 2 : 3}
          onReady={({ id_form }) =>
            setDynamicForm((prev) => ({ ...prev, id_form }))
          }
          onChange={(answers) =>
            setDynamicForm((prev) => ({ ...prev, answers }))
          }
          onMetaChange={handleMetaChange}
        />
      ),
    },

    {
      step: 'finish',
      progress: 100,
      content: (
        <div>
          <h5 className="mb-3" style={{ textTransform: 'capitalize' }}>
            Tudo pronto para começar o seu negócio!
          </h5>
          <p>Você encontrará tudo para ter um negócio sólido e lucrativo online.</p>
        </div>
      ),
    },
  ].filter(Boolean);

  const currentPage = pages[selectedPage] || {};
  const { step } = currentPage;

  const handleNext = () => {
    if (step === 'flowType' && !flowType) {
      notify({ type: 'warning', message: 'Selecione uma opção para continuar.' });
      return;
    }

    if (step === 'dynamic_form') {
      if (!dynamicMeta.isFinished) {
        if (!dynamicMeta.canNext) {
          notify({
            type: 'warning',
            message: 'Responda todas as perguntas obrigatórias.',
          });
          return;
        }

        const advanced = dynamicMeta?.next?.();
        if (advanced) return;
      }
    }

    setSelectedPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step === 'dynamic_form' && dynamicMeta.current > 0) {
      dynamicMeta?.prev?.();
      return;
    }
    setSelectedPage((prev) => Math.max(0, prev - 1));
  };

  const progress = (() => {
    if (step === 'dynamic_form' && dynamicMeta.total > 0) {
      const prev = pages[selectedPage - 1]?.progress ?? 0;
      const next = pages[selectedPage + 1]?.progress ?? 100;
      const fraction = Math.max(
        0,
        Math.min(1, dynamicMeta.current / dynamicMeta.total)
      );
      return prev + (next - prev) * fraction;
    }
    return currentPage.progress || 0;
  })();

  return (
    <div className="mt-5">
      <Container>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h3 className="d-block mb-5 text-center">Onboarding B4you</h3>

          <ProgressBar variant="info" className="mb-4" now={progress} />

          <Card>
            <Card.Body>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="content">{currentPage?.content}</div>

                <div className="d-flex justify-content-between mt-4">
                  {selectedPage > 0 && status !== STATUS.success && (
                    <ButtonDS type="button" outline onClick={handlePrev}>
                      Voltar
                    </ButtonDS>
                  )}

                  {step === 'flowType' && (
                    <ButtonDS
                      type="button"
                      style={{ marginLeft: 'auto' }}
                      onClick={handleNext}
                      disabled={!flowType}
                    >
                      Continuar
                    </ButtonDS>
                  )}

                  {step === 'dynamic_form' && !dynamicMeta.isFinished && (
                    <ButtonDS
                      type="button"
                      style={{ marginLeft: 'auto' }}
                      onClick={handleNext}
                    >
                      Continuar
                    </ButtonDS>
                  )}

                  {step === 'dynamic_form' && dynamicMeta.isFinished && (
                    <ButtonDS
                      type="submit"
                      disabled={status === STATUS.loading}
                      style={{ marginLeft: 'auto' }}
                    >
                      {status === STATUS.loading ? 'Aguarde...' : 'Finalizar'}
                    </ButtonDS>
                  )}

                  {step === 'finish' && (
                    <ButtonDS
                      type="button"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => (window.location.pathname = '/')}
                    >
                      Ir para a plataforma
                    </ButtonDS>
                  )}
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Onboarding;