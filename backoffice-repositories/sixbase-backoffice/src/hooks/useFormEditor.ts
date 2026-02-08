import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getUserData } from '../utility/Utils';
import { useSkin } from '../utility/hooks/useSkin';
import {
  createFormDraft,
  createQuestion as apiCreateQuestion,
  deactivateForm,
  deactivateQuestion as apiDeactivateQuestion,
  getFormById,
  listForms,
  publishFormVersion,
  reorderQuestions,
  updateFormMetadata,
  updateQuestion as apiUpdateQuestion,
  type FormQuestion,
  type FormSummary,
} from '../services/forms.service';

export type Question = FormQuestion & { step?: number };

const FORM_TYPE_LABEL_MAP: Record<number, string> = {
  2: 'Onboarding Creator',
  3: 'Onboarding Marca',
};

const DEFAULT_WINDOW_WIDTH = 1920;
const WINDOW_MOBILE_BREAKPOINT = 768;

const sortForms = (forms: FormSummary[]) =>
  [...forms].sort((a, b) => {
    const activeComparison = Number(b.is_active) - Number(a.is_active);
    if (activeComparison !== 0) return activeComparison;
    return a.title.localeCompare(b.title);
  });

export const useFormEditor = () => {
  const user = useMemo(() => {
    try {
      return getUserData();
    } catch {
      return null;
    }
  }, []);

  const isMaster = String(user?.role || '').toUpperCase() === 'MASTER';
  const isAdmin = Boolean(user?.is_admin) || isMaster;

  const { skin } = useSkin();
  const isDark = skin === 'dark';

  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : DEFAULT_WINDOW_WIDTH,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < WINDOW_MOBILE_BREAKPOINT;

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [preview, setPreview] = useState(false);
  const [previewStep, setPreviewStep] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('1');

  const sortedForms = useMemo(() => sortForms(forms), [forms]);

  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishAction, setPublishAction] = useState<'new' | 'current' | null>(
    null,
  );

  const pendingChangesRef = useRef<Record<number, Partial<Question>>>({});
  const timersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const [originalFormData, setOriginalFormData] = useState<{
    title: string;
    form_type: number;
    questions: Question[];
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingSaveAction, setPendingSaveAction] = useState<
    (() => Promise<void>) | null
  >(null);

  const containerGradient = useMemo(
    () =>
      isDark
        ? 'linear-gradient(135deg, #272f45 0%, #1e2538 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    [isDark],
  );

  const getSteps = useCallback(
    () =>
      Array.from(new Set((questions || []).map((q) => q.step || 1))).sort(
        (a, b) => a - b,
      ),
    [questions],
  );

  const syncCurrentForm = useCallback(
    async (formId: number) => {
      const { rows } = await listForms({ page: 0, size: 50 });
      const allForms = rows || [];
      setForms(allForms);
      const currentForm = allForms.find((f) => f.id === formId);

      const form = await getFormById(formId);
      const qs = ((form.questions || []) as Question[])
        .slice()
        .sort((a, b) => a.order - b.order);
      setQuestions(qs);
      setPreview(false);
      setPreviewStep(1);

      if (currentForm) {
        setOriginalFormData({
          title: currentForm.title,
          form_type: currentForm.form_type,
          questions: qs,
        });
        setHasChanges(false);
      }
    },
    [setForms],
  );

  const refreshForms = useCallback(async () => {
    const { rows } = await listForms({ page: 0, size: 50 });
    const allForms = rows || [];
    setForms(allForms);
    if (!selectedFormId && allForms.length) {
      setSelectedFormId(allForms[0].id);
    }
  }, [selectedFormId]);

  useEffect(() => {
    refreshForms();
  }, [refreshForms]);

  useEffect(() => {
    if (!selectedFormId) return;
    let cancelled = false;
    (async () => {
      await syncCurrentForm(selectedFormId);
      if (!cancelled) {
        setPreview(false);
        setPreviewStep(1);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedFormId, syncCurrentForm]);

  useEffect(() => {
    if (!selectedFormId || !originalFormData) return;
    const currentForm = forms.find((f) => f.id === selectedFormId);
    if (!currentForm) return;

    const metadataChanged =
      currentForm.title !== originalFormData.title ||
      currentForm.form_type !== originalFormData.form_type;

    const originalQuestionsMap = new Map(
      originalFormData.questions.map((q) => [q.id, q]),
    );
    const currentQuestionsMap = new Map(questions.map((q) => [q.id, q]));

    const questionsCountChanged =
      questions.length !== originalFormData.questions.length;
    const hasNewQuestions = questions.some(
      (q) => !originalQuestionsMap.has(q.id),
    );
    const hasRemovedQuestions = originalFormData.questions.some(
      (q) => !currentQuestionsMap.has(q.id),
    );
    const questionsModified = questions.some((q) => {
      const original = originalQuestionsMap.get(q.id);
      if (!original) return false;
      return (
        q.label !== original.label ||
        q.type !== original.type ||
        q.order !== original.order ||
        JSON.stringify(q.options || []) !==
          JSON.stringify(original.options || [])
      );
    });

    const questionsChanged =
      questionsCountChanged ||
      hasNewQuestions ||
      hasRemovedQuestions ||
      questionsModified;

    setHasChanges(metadataChanged || questionsChanged);
  }, [forms, questions, selectedFormId, originalFormData]);

  useEffect(
    () => () => {
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    },
    [],
  );

  const handleSelectForm = useCallback((id: number | null) => {
    setSelectedFormId(id);
  }, []);

  const handleCreateForm = useCallback(async () => {
    const created = await createFormDraft({
      title: `Formulário ${new Date().toLocaleDateString()}`,
      form_type: 2,
    });
    await refreshForms();
    setSelectedFormId(created.id);
  }, [refreshForms]);

  const handleTitleChange = useCallback(
    (value: string) => {
      if (!selectedFormId) return;
      setForms((prev) =>
        prev.map((f) => (f.id === selectedFormId ? { ...f, title: value } : f)),
      );
    },
    [selectedFormId],
  );

  const handleFormTypeChange = useCallback(
    async (value: number): Promise<boolean> => {
      if (!selectedFormId) return false;
      const currentForm = forms.find((f) => f.id === selectedFormId);
      if (!currentForm) return false;
      const answersCount = currentForm.answers_count || 0;
      if (answersCount > 0) {
        alert(
          `Não é possível alterar o tipo deste formulário pois ele possui ${answersCount} resposta(s) registrada(s).`,
        );
        return false;
      }
      try {
        await updateFormMetadata(selectedFormId, { form_type: value });
        await refreshForms();
        return true;
      } catch (error: any) {
        alert(
          error?.response?.data?.message ||
            'Erro ao atualizar o tipo do formulário.',
        );
        return false;
      }
    },
    [forms, refreshForms, selectedFormId],
  );

  const handleSaveMetadata = useCallback(async () => {
    if (!selectedFormId) return;
    const currentForm = forms.find((f) => f.id === selectedFormId);
    if (!currentForm) return;
    await updateFormMetadata(selectedFormId, {
      title: currentForm.title,
      form_type: currentForm.form_type,
    });
  }, [forms, selectedFormId]);

  const handleDeleteForm = useCallback(async () => {
    if (!selectedFormId) return;
    const current = forms.find((f) => f.id === selectedFormId);
    if (!current) return;
    const answersCount = current.answers_count || 0;
    if (answersCount > 0) {
      alert(
        `Não é possível excluir este formulário pois ele possui ${answersCount} resposta(s) registrada(s).`,
      );
      return;
    }
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o formulário "${current.title}"?`,
    );
    if (!confirmed) return;
    await deactivateForm(selectedFormId);
    const { rows } = await listForms({ page: 0, size: 50 });
    const allForms = rows || [];
    setForms(allForms);
    if (allForms.length) {
      setSelectedFormId(allForms[0].id);
    } else {
      setSelectedFormId(null);
      setQuestions([]);
    }
  }, [forms, selectedFormId]);

  const handleToggleActive = useCallback(async () => {
    if (!selectedFormId) return;
    const current = forms.find((f) => f.id === selectedFormId);
    if (!current) return;
    await updateFormMetadata(selectedFormId, {
      is_active: !current.is_active,
    });
    await refreshForms();
  }, [forms, refreshForms, selectedFormId]);

  const handleReorderQuestions = useCallback(
    async (reordered: Question[]) => {
      const remapped = reordered.map((q, index) => ({
        ...q,
        order: index + 1,
      }));
      setQuestions(remapped);
      if (!selectedFormId) return;
      await reorderQuestions(
        selectedFormId,
        remapped.map((q) => ({ questionId: q.id, order: q.order })),
      );
    },
    [selectedFormId],
  );

  const handleMoveQuestion = useCallback(
    async (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= questions.length) return;
      const next = [...questions];
      [next[index], next[target]] = [next[target], next[index]];
      const remapped = next.map((q, i) => ({ ...q, order: i + 1 }));
      setQuestions(remapped);
      if (!selectedFormId) return;
      await reorderQuestions(
        selectedFormId,
        remapped.map((q) => ({ questionId: q.id, order: q.order })),
      );
    },
    [questions, selectedFormId],
  );

  const handleDuplicateQuestion = useCallback(
    async (index: number) => {
      if (!selectedFormId) return;
      const question = questions[index];
      const created = await apiCreateQuestion(selectedFormId, {
        key: `${question.key}_copy`,
        label: question.label,
        type: question.type,
        options: question.options,
        required: true,
        order: (question.order + 0.1) as any,
        visible_if: question.visible_if,
        is_active: true,
        help_text: question.help_text,
        placeholder: question.placeholder,
      } as any);
      const next = [...questions, created as Question]
        .sort((a, b) => a.order - b.order)
        .map((q, idx) => ({ ...q, order: idx + 1 }));
      setQuestions(next);
      await reorderQuestions(
        selectedFormId,
        next.map((q) => ({ questionId: q.id, order: q.order })),
      );
    },
    [questions, selectedFormId],
  );

  const handleRemoveQuestion = useCallback(
    async (index: number) => {
      const question = questions[index];
      await apiDeactivateQuestion(question.id);
      const next = questions
        .filter((_, idx) => idx !== index)
        .map((q, idx) => ({ ...q, order: idx + 1 }));
      setQuestions(next);
      if (!selectedFormId) return;
      await reorderQuestions(
        selectedFormId,
        next.map((q) => ({ questionId: q.id, order: q.order })),
      );
    },
    [questions, selectedFormId],
  );

  const handleUpdateQuestion = useCallback(
    (questionId: number, changes: Partial<Question>) => {
      setQuestions((prev) => {
        const needsResort = 'step' in changes || 'order' in changes;
        const next = prev.map((q) =>
          q.id === questionId ? { ...q, ...changes } : q,
        );
        if (!needsResort) return next;
        const sorted = next
          .slice()
          .sort((a, b) => (a.step || 1) - (b.step || 1) || a.order - b.order);
        return sorted.map((q, idx) => ({ ...q, order: idx + 1 }));
      });

      pendingChangesRef.current[questionId] = {
        ...(pendingChangesRef.current[questionId] || {}),
        ...changes,
      };

      if (timersRef.current[questionId]) {
        clearTimeout(timersRef.current[questionId]);
      }

      timersRef.current[questionId] = setTimeout(async () => {
        const payload = pendingChangesRef.current[questionId];
        if (!payload) return;
        try {
          const saved = await apiUpdateQuestion(questionId, payload as any);
          setQuestions((prev) =>
            prev.map((q) => (q.id === questionId ? { ...q, ...saved } : q)),
          );
        } finally {
          delete pendingChangesRef.current[questionId];
          if (timersRef.current[questionId]) {
            clearTimeout(timersRef.current[questionId]);
            delete timersRef.current[questionId];
          }
        }
      }, 400);
    },
    [],
  );

  const handleSaveQuestion = useCallback(
    async (questionId: number, changes: Partial<Question>) => {
      const saved = await apiUpdateQuestion(questionId, changes as any);
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...saved } : q)),
      );
    },
    [],
  );

  const handleAddQuestion = useCallback(async () => {
    if (!selectedFormId) return;
    const steps = getSteps();
    const nextStep = (steps[steps.length - 1] || 0) + 1;
    const created = await apiCreateQuestion(selectedFormId, {
      key: `field_${Date.now()}`,
      label: 'Nova pergunta',
      type: 'text',
      required: true,
      order: questions.length + 1,
      visible_if: null,
      is_active: true,
      help_text: '',
      placeholder: '',
    } as any);
    setQuestions((prev) =>
      [...prev, { ...(created as Question), step: nextStep }]
        .sort((a, b) => (a.step || 1) - (b.step || 1) || a.order - b.order)
        .map((q, idx) => ({ ...q, order: idx + 1 })),
    );
  }, [getSteps, questions.length, selectedFormId]);

  const handleTogglePreview = useCallback(() => {
    setPreview((prev) => !prev);
  }, []);

  const handleSaveWithVersionCheck = useCallback(
    async (saveAction: () => Promise<void>) => {
      if (!hasChanges || !selectedFormId) {
        await saveAction();
        return;
      }
      setPendingSaveAction(() => saveAction);
      setShowVersionModal(true);
    },
    [hasChanges, selectedFormId],
  );

  const handleConfirmVersion = useCallback(async () => {
    if (!selectedFormId || !pendingSaveAction) return;
    await publishFormVersion(selectedFormId);
    await pendingSaveAction();
    await syncCurrentForm(selectedFormId);
    setPendingSaveAction(null);
    setShowVersionModal(false);
  }, [pendingSaveAction, selectedFormId, syncCurrentForm]);

  const handleCancelVersion = useCallback(() => {
    setShowWarningModal(true);
  }, []);

  const handleConfirmWithoutVersion = useCallback(async () => {
    if (!pendingSaveAction || !selectedFormId) return;
    await pendingSaveAction();
    await syncCurrentForm(selectedFormId);
    setPendingSaveAction(null);
    setShowVersionModal(false);
    setShowWarningModal(false);
  }, [pendingSaveAction, selectedFormId, syncCurrentForm]);

  const handleCloseWarningModal = useCallback(() => {
    setShowWarningModal(false);
    setShowVersionModal(false);
    setPendingSaveAction(null);
  }, []);

  const handleOpenPublishModal = useCallback(() => {
    setPublishAction(null);
    setPublishConfirmOpen(true);
  }, []);

  const handleClosePublishModal = useCallback(() => {
    setPublishConfirmOpen(false);
    setPublishAction(null);
  }, []);

  const handleConfirmPublish = useCallback(async () => {
    if (!selectedFormId || !publishAction) return;
    try {
      setPublishLoading(true);
      if (publishAction === 'new') {
        await publishFormVersion(selectedFormId);
      } else {
        const currentForm = forms.find((f) => f.id === selectedFormId);
        if (currentForm && !currentForm.is_active) {
          await updateFormMetadata(selectedFormId, { is_active: true });
        }
      }
      await refreshForms();
      setPublishConfirmOpen(false);
      setPublishAction(null);
    } finally {
      setPublishLoading(false);
    }
  }, [forms, publishAction, refreshForms, selectedFormId]);

  const currentForm = useMemo(
    () => (selectedFormId ? forms.find((f) => f.id === selectedFormId) : null),
    [forms, selectedFormId],
  );

  const answersCount = currentForm?.answers_count ?? 0;

  return {
    isAdmin,
    isDark,
    isMobile,
    containerGradient,
    forms,
    sortedForms,
    selectedFormId,
    questions,
    setQuestions,
    currentForm,
    answersCount,
    formTypeLabelMap: FORM_TYPE_LABEL_MAP,
    preview,
    previewStep,
    activeTab,
    hasChanges,
    publishConfirmOpen,
    publishLoading,
    publishAction,
    showVersionModal,
    showWarningModal,
    setActiveTab,
    setPreviewStep,
    handleSelectForm,
    handleCreateForm,
    handleTitleChange,
    handleFormTypeChange,
    handleSaveWithVersionCheck,
    handleSaveMetadata,
    handleDeleteForm,
    handleToggleActive,
    handleReorderQuestions,
    handleMoveQuestion,
    handleDuplicateQuestion,
    handleRemoveQuestion,
    handleUpdateQuestion,
    handleSaveQuestion,
    handleAddQuestion,
    handleTogglePreview,
    handleConfirmVersion,
    handleCancelVersion,
    handleConfirmWithoutVersion,
    handleCloseWarningModal,
    setShowVersionModal,
    setPendingSaveAction,
    pendingSaveAction,
    setPublishAction,
    handleOpenPublishModal,
    handleClosePublishModal,
    handleConfirmPublish,
    setPreview,
    refreshCurrentForm: syncCurrentForm,
    getSteps,
  };
};
